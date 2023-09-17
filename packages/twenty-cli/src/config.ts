import { exec } from 'child_process';

export const execShell = (cmd: string): Promise<string> =>
  new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(`Error: ${error.message}`);
        console.warn(`stderr: ${stderr}`);
        reject(error);
      }
      resolve(stdout ? stdout : stderr);
    });
  });

export const REPO_URL = 'https://github.com/twentyhq/twenty.git';
export const CLONE_DIR = 'twenty';
