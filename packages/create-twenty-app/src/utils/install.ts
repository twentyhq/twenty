import chalk from 'chalk';
import { promisify } from 'util';
import { exec } from 'child_process';

const execPromise = promisify(exec);

export const install = async (
  root: string,
  onProgress?: (message: string) => void,
) => {
  onProgress?.('Enabling corepack');
  try {
    await execPromise('corepack enable', { cwd: root });
  } catch (error: any) {
    console.warn(chalk.yellow('corepack enable failed:'), error.stderr);
  }

  onProgress?.('Running yarn install');
  try {
    await execPromise('yarn install', { cwd: root });
  } catch (error: any) {
    console.warn(chalk.yellow('yarn install failed:'), error.stdout);
  }
};
