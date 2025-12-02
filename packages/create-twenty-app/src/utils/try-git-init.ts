import * as fs from 'fs-extra';
import { join } from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

const execPromise = promisify(exec);

const isInGitRepository = async (): Promise<boolean> => {
  try {
    await execPromise('git rev-parse --is-inside-work-tree');
    return true;
  } catch {
    // Empty catch block
  }
  return false;
};

const isInMercurialRepository = async (): Promise<boolean> => {
  try {
    await execPromise('hg --cwd . root');
    return true;
  } catch {
    // Empty catch block
  }
  return false;
};

const isDefaultBranchSet = async (): Promise<boolean> => {
  try {
    await execPromise('git config init.defaultBranch');
    return true;
  } catch {
    // Empty catch block
  }
  return false;
};

export const tryGitInit = async (root: string): Promise<boolean> => {
  let didInit = false;
  try {
    await execPromise('git --version');
    if ((await isInGitRepository()) || (await isInMercurialRepository())) {
      return false;
    }

    await execPromise('git init');
    didInit = true;

    if (!isDefaultBranchSet()) {
      await execPromise('git checkout -b main');
    }

    await execPromise('git add -A');
    await execPromise('git commit -m "Initial commit from Create Next App"');
    return true;
  } catch {
    if (didInit) {
      try {
        fs.rm(join(root, '.git'), { recursive: true, force: true });
      } catch {
        // Empty catch block
      }
    }
    return false;
  }
};
