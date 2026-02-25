import chalk from 'chalk';
import { promisify } from 'util';
import { exec } from 'child_process';

const execPromise = promisify(exec);

export const install = async (root: string) => {
  try {
    await execPromise('corepack enable', { cwd: root });
    await execPromise('yarn install', { cwd: root });
  } catch (error: any) {
    console.error(chalk.red('yarn install failed:'), error.stdout);
  }
};
