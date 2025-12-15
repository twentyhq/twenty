import * as fs from 'fs-extra';
import { join } from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

const execPromise = promisify(exec);

const isInGitRepository = async (root: string): Promise<boolean> => {
  try {
    await execPromise('git rev-parse --is-inside-work-tree', { cwd: root });
    return true;
  } catch {
    // Empty catch block
  }
  return false;
};

const isInMercurialRepository = async (root: string): Promise<boolean> => {
  try {
    await execPromise('hg --cwd . root', { cwd: root });
    return true;
  } catch {
    // Empty catch block
  }
  return false;
};

const isDefaultBranchSet = async (root: string): Promise<boolean> => {
  try {
    await execPromise('git config init.defaultBranch', { cwd: root });
    return true;
  } catch {
    // Empty catch block
  }
  return false;
};

export const tryGitInit = async (root: string): Promise<boolean> => {
  try {
    await execPromise('git --version', { cwd: root });

    if (
      (await isInGitRepository(root)) ||
      (await isInMercurialRepository(root))
    ) {
      return false;
    }
    await execPromise('git init', { cwd: root });

    try {
      if (!(await isDefaultBranchSet(root))) {
        await execPromise('git checkout -b main', { cwd: root });
      }

      await execPromise('git add -A', { cwd: root });
      await execPromise(
        'git commit -m "Initial commit from Create Twenty App"',
        {
          cwd: root,
        },
      );
      return true;
    } catch {
      fs.rm(join(root, '.git'), { recursive: true, force: true });
      return false;
    }
  } catch {
    return false;
  }
};
