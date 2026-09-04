import {
  emptyDir,
  ensureDir,
  move,
  pathExists,
  remove,
} from '@/cli/utilities/file/fs-utils';
import {
  type PullDeletion,
  type PullWrite,
} from '@/cli/utilities/pull/plan-pull-writes';
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const PULL_STAGING_DIRECTORY = '.twenty/pull-staging';

export const applyPullWrites = async ({
  appPath,
  writes,
  deletions,
}: {
  appPath: string;
  writes: PullWrite[];
  deletions: PullDeletion[];
}): Promise<void> => {
  const stagingDirectory = join(appPath, PULL_STAGING_DIRECTORY);

  await emptyDir(stagingDirectory);

  try {
    for (const write of writes) {
      const stagedPath = join(stagingDirectory, write.relativePath);

      await ensureDir(dirname(stagedPath));
      await writeFile(stagedPath, write.content);
    }

    for (const write of writes) {
      const destinationPath = join(appPath, write.relativePath);

      await ensureDir(dirname(destinationPath));
      await remove(destinationPath);
      await move(join(stagingDirectory, write.relativePath), destinationPath);
    }

    for (const deletion of deletions) {
      const destinationPath = join(appPath, deletion.relativePath);

      if (await pathExists(destinationPath)) {
        await remove(destinationPath);
      }
    }
  } finally {
    await remove(stagingDirectory);
  }
};
