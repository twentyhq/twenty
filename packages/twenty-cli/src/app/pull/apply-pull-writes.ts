import { copy, ensureDir, pathExists, remove } from '@/app/fs-utils';
import { type PullDeletion, type PullWrite } from '@/app/pull/plan-pull-writes';
import { CliError } from '@/output/cli-error';
import { lstat, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

const PULL_WORK_DIRECTORY = '.twenty/cli';

const assertPlanIsApplicable = async ({
  appPath,
  writes,
  deletions,
}: {
  appPath: string;
  writes: Pick<PullWrite, 'relativePath' | 'content'>[];
  deletions: PullDeletion[];
}): Promise<void> => {
  const relativePaths = writes.map((write) => write.relativePath);

  if (new Set(relativePaths).size !== relativePaths.length) {
    throw new Error(
      'Refusing to write: two entities resolved to the same file path',
    );
  }

  const applicationRoot = resolve(appPath);

  for (const relativePath of [
    ...relativePaths,
    ...deletions.map((deletion) => deletion.relativePath),
  ]) {
    const containedPath = relative(
      applicationRoot,
      resolve(applicationRoot, relativePath),
    );

    if (
      containedPath.length === 0 ||
      containedPath === '..' ||
      containedPath.startsWith(`..${sep}`) ||
      isAbsolute(containedPath)
    ) {
      throw new Error(
        `Refusing to write: ${relativePath} leaves the application directory`,
      );
    }

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
  finalWrite,
  signal,
}: {
  appPath: string;
  writes: PullWrite[];
  deletions: PullDeletion[];
  finalWrite?: Pick<PullWrite, 'relativePath' | 'content'>;
  signal?: AbortSignal;
}): Promise<void> => {
  const allWrites = finalWrite ? [...writes, finalWrite] : writes;

  signal?.throwIfAborted();
  await assertPlanIsApplicable({ appPath, writes: allWrites, deletions });

  const workDirectory = join(appPath, PULL_WORK_DIRECTORY);

  await ensureDir(workDirectory);

  const stagingDirectory = await mkdtemp(join(workDirectory, 'pull-staging-'));
  const backupDirectory = await mkdtemp(join(workDirectory, 'pull-backup-'));
  const backedUpRelativePaths: string[] = [];
  const writtenRelativePaths: string[] = [];

  try {
    for (const write of allWrites) {
      const stagedPath = join(stagingDirectory, write.relativePath);

      await ensureDir(dirname(stagedPath));
      await writeFile(
        stagedPath,
        write.content,
        write === finalWrite ? { mode: 0o600 } : undefined,
      );
    }

    for (const relativePath of [
      ...allWrites.map((write) => write.relativePath),
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

    signal?.throwIfAborted();

    for (const write of writes) {
      const destinationPath = join(appPath, write.relativePath);

      await ensureDir(dirname(destinationPath));
      writtenRelativePaths.push(write.relativePath);
      await copy(join(stagingDirectory, write.relativePath), destinationPath);
    }

    for (const deletion of deletions) {
      await rm(join(appPath, deletion.relativePath), { force: true });
    }

    if (finalWrite) {
      const destinationPath = join(appPath, finalWrite.relativePath);

      await ensureDir(dirname(destinationPath));
      writtenRelativePaths.push(finalWrite.relativePath);
      await copy(
        join(stagingDirectory, finalWrite.relativePath),
        destinationPath,
      );
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
      await remove(stagingDirectory).catch(() => undefined);

      throw new CliError({
        code: 'PULL_FAILED',
        details: { outcome: 'unknown', backupDirectory },
        message: `Pull failed and could not restore every file it had replaced. The originals are kept in ${backupDirectory}.\nOriginal failure: ${error instanceof Error ? error.message : String(error)}\nRestore failure: ${restoreError instanceof Error ? restoreError.message : String(restoreError)}`,
      });
    }

    await remove(stagingDirectory);
    await remove(backupDirectory);

    if (signal?.aborted && Object.is(error, signal.reason)) {
      throw error;
    }
    throw new CliError({
      code: 'PULL_FAILED',
      message: error instanceof Error ? error.message : String(error),
      details: { outcome: 'unchanged' },
    });
  }

  try {
    await remove(stagingDirectory);
    await remove(backupDirectory);
  } catch (error) {
    throw new CliError({
      code: 'PULL_FAILED',
      message: `Pull completed, but temporary files could not be removed: ${error instanceof Error ? error.message : String(error)}`,
      details: { outcome: 'pulled', backupDirectory, stagingDirectory },
    });
  }
};
