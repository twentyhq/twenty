import {
  copy,
  ensureDir,
  pathExists,
  remove,
} from '@/cli/utilities/file/fs-utils';
import {
  type PullDeletion,
  type PullWrite,
} from '@/cli/utilities/pull/plan-pull-writes';
import { lstat, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const PULL_WORK_DIRECTORY = '.twenty';

const assertPlanIsApplicable = async ({
  appPath,
  writes,
  deletions,
}: {
  appPath: string;
  writes: PullWrite[];
  deletions: PullDeletion[];
}): Promise<void> => {
  const relativePaths = writes.map((write) => write.relativePath);

  if (new Set(relativePaths).size !== relativePaths.length) {
    throw new Error(
      'Refusing to write: two entities resolved to the same file path',
    );
  }

  for (const relativePath of [
    ...relativePaths,
    ...deletions.map((deletion) => deletion.relativePath),
  ]) {
    const destinationPath = join(appPath, relativePath);

    if (!(await pathExists(destinationPath))) {
      continue;
    }

    const destinationStats = await lstat(destinationPath);

    if (destinationStats.isDirectory()) {
      throw new Error(
        `Refusing to write: ${relativePath} is a directory, and pull never deletes a folder`,
      );
    }
  }
};

const backUpExistingFile = async ({
  appPath,
  backupDirectory,
  relativePath,
}: {
  appPath: string;
  backupDirectory: string;
  relativePath: string;
}): Promise<boolean> => {
  const destinationPath = join(appPath, relativePath);

  if (!(await pathExists(destinationPath))) {
    return false;
  }

  const backupPath = join(backupDirectory, relativePath);

  await ensureDir(dirname(backupPath));
  await copy(destinationPath, backupPath);

  return true;
};

const restoreBackedUpFiles = async ({
  appPath,
  backupDirectory,
  backedUpRelativePaths,
  writtenRelativePaths,
}: {
  appPath: string;
  backupDirectory: string;
  backedUpRelativePaths: string[];
  writtenRelativePaths: string[];
}): Promise<void> => {
  for (const relativePath of writtenRelativePaths) {
    await rm(join(appPath, relativePath), { force: true });
  }

  for (const relativePath of backedUpRelativePaths) {
    const destinationPath = join(appPath, relativePath);

    await ensureDir(dirname(destinationPath));
    await rm(destinationPath, { force: true });
    await copy(join(backupDirectory, relativePath), destinationPath);
  }
};

export const applyPullWrites = async ({
  appPath,
  writes,
  deletions,
}: {
  appPath: string;
  writes: PullWrite[];
  deletions: PullDeletion[];
}): Promise<void> => {
  await assertPlanIsApplicable({ appPath, writes, deletions });

  const workDirectory = join(appPath, PULL_WORK_DIRECTORY);

  await ensureDir(workDirectory);

  const stagingDirectory = await mkdtemp(join(workDirectory, 'pull-staging-'));
  const backupDirectory = await mkdtemp(join(workDirectory, 'pull-backup-'));
  const backedUpRelativePaths: string[] = [];
  const writtenRelativePaths: string[] = [];

  try {
    for (const write of writes) {
      const stagedPath = join(stagingDirectory, write.relativePath);

      await ensureDir(dirname(stagedPath));
      await writeFile(stagedPath, write.content);
    }

    for (const relativePath of [
      ...writes.map((write) => write.relativePath),
      ...deletions.map((deletion) => deletion.relativePath),
    ]) {
      const wasBackedUp = await backUpExistingFile({
        appPath,
        backupDirectory,
        relativePath,
      });

      if (wasBackedUp) {
        backedUpRelativePaths.push(relativePath);
      }
    }

    for (const write of writes) {
      const destinationPath = join(appPath, write.relativePath);

      await ensureDir(dirname(destinationPath));
      writtenRelativePaths.push(write.relativePath);
      await copy(join(stagingDirectory, write.relativePath), destinationPath);
    }

    for (const deletion of deletions) {
      await rm(join(appPath, deletion.relativePath), { force: true });
    }
  } catch (error) {
    try {
      await restoreBackedUpFiles({
        appPath,
        backupDirectory,
        backedUpRelativePaths,
        writtenRelativePaths: writtenRelativePaths.filter(
          (relativePath) => !backedUpRelativePaths.includes(relativePath),
        ),
      });
    } catch (restoreError) {
      await remove(stagingDirectory);

      throw new Error(
        `Pull failed and could not restore every file it had replaced. The originals are kept in ${backupDirectory}.\nOriginal failure: ${error instanceof Error ? error.message : String(error)}\nRestore failure: ${restoreError instanceof Error ? restoreError.message : String(restoreError)}`,
      );
    }

    await remove(stagingDirectory);
    await remove(backupDirectory);

    throw error;
  }

  await remove(stagingDirectory);
  await remove(backupDirectory);
};
