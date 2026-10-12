import { readBlobChunks } from '@/utils/read-blob-chunks';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { readSnapshotFile } from '@/app/deployment/read-snapshot-file';
import { resolveSnapshotDirectory } from '@/app/deployment/resolve-snapshot-directory';
import { type ToolingBuild } from '@/app/types/tooling-result.type';

export const retainDevSnapshot = async ({
  build,
  appPath,
  signal,
}: {
  build: ToolingBuild;
  appPath: string;
  signal: AbortSignal;
}) => {
  signal.throwIfAborted();
  const sourceDirectory = resolveSnapshotDirectory({
    build,
    appPath,
  });
  const root = join(appPath, '.twenty', 'cli', 'snapshots');

  await mkdir(root, { recursive: true });
  const directory = await mkdtemp(join(root, 'dev-'));
  const release = () => rm(directory, { recursive: true, force: true });

  try {
    for (const artifact of build.files) {
      signal.throwIfAborted();
      const bytes = await readSnapshotFile({
        snapshotDirectory: sourceDirectory,
        artifact,
      });
      const destination = join(directory, artifact.path);

      await mkdir(dirname(destination), { recursive: true });
      await writeFile(destination, readBlobChunks(bytes), {
        flag: 'wx',
        signal,
      });
    }

    signal.throwIfAborted();

    return { build: { ...build, directory }, release };
  } catch (error) {
    await release();

    throw error;
  }
};
