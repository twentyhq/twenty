import chalk from 'chalk';
import { promisify } from 'util';
import { exec } from 'child_process';

const execPromise = promisify(exec);

export const install = async (root: string) => {
  console.log(chalk.gray('Installing yarn dependencies...'));
  try {
    await execPromise('corepack enable', { cwd: root });
  } catch (error: any) {
    console.warn(chalk.yellow('corepack enabled failed:'), error.stderr);
  }

  try {
    await execPromise('yarn install', { cwd: root });
  } catch (error: any) {
    console.warn(chalk.yellow('yarn install failed:'), error.stdout);
  }
};
