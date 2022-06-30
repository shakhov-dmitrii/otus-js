import { join } from 'path';
import { readdir, lstat } from 'fs/promises';
import { platform } from 'os';

const UNIX_SYSTEMS = ['android', 'darwin', 'freebsd', 'linux', 'openbsd', 'netbsd'];
const WIN_SYSTEMS = ['win32', 'cygwin'];

(async () => {
    let fileCounter = 0;
    let dirCounter = 0;
    try {
        let {usersPath, slash} = getUserPath();
        let depth = getDepth();
        
        let currDir = usersPath.split(slash)[usersPath.split(slash).length - 1]
        console.log(currDir)

        const q = [...(await readdir(join(usersPath)))];
        while (q.length > 0) {
            const curr = q.shift()
            const cnt = curr.split(slash).length - 1

            if ((await lstat(join(usersPath, curr))).isDirectory()) {
                dirCounter += 1;
                console.log(`${getPrefix(q, curr, cnt, slash)}${curr.split(slash)[cnt]}`)
                const dirFiles = await readdir(join(usersPath, curr));
                if (cnt + 1 >= depth && depth) {
                    continue
                }
                for (let file of dirFiles) {
                    q.unshift(`${curr}/${file}`)
                }
            } else {
                fileCounter += 1;
                console.log(`${getPrefix(q, curr, cnt, slash)}${curr.split(slash)[cnt]}`)
            }
          }
    } catch (err) {
        console.log(err.message)
    }
    console.log(`${dirCounter} directories, ${fileCounter} files`)
    
})();


function getPrefix(queue, curr, cnt, slash) {
    const tmp = curr.split(slash)
    let index = cnt
    let flag = false

    for (let q of queue) {
        for (let i = 0; i < tmp.length; i++) {
            if (!q.includes(tmp.slice(0, i + 1).join(slash)) && index > i) {
                index = i 
            }
        }
        if (q.includes(tmp.slice(0, tmp.length - 1).join(slash)) && !flag) {
            flag = true
        }
    }
    return `${'    '.repeat(index)}${'|   '.repeat(cnt - index)}${flag ? '├──' : '└──'}`
}

function getUserPath() {
    if (UNIX_SYSTEMS.includes(platform()) && /^\//.test(process.argv[2])) {
        return {
            usersPath: join('/', ...process.argv[2].split('/')),
            slash: '/'
        }
    } else if (WIN_SYSTEMS.includes(platform()) && /^[a-zA-Z]:\\(?:\w+\\?)*$/) {
        return {
            usersPath: join(...process.argv[2].split('\\')),
            slash: '\\'
        }
    } else {
        throw new Error('Wrong path')
    }
}

function getDepth() {
    if (process.argv[3]) {
        if ((process.argv[3] === '--depth' || process.argv[3] === '-d') && process.argv[4]) {
            return process.argv[4]
        } else {
            throw new Error('Wrong option')
        }
    }
    return null;
}
