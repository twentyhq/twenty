import { createHash } from 'node:crypto';
import { openAsBlob } from 'node:fs';
import { resolve } from 'node:path';

import { type ToolingArtifact } from '@/app/types/tooling-result.type';
import { CliError } from '@/output/cli-error';
import { isInsideDirectory } from '@/utils/is-inside-directory';
import { readBlobChunks } from '@/utils/read-blob-chunks';

const createSnapshotInvalidError = ({
  message,
  path,
}: {
  message: string;
  path: string;
}) =>
  new CliError({
    code: 'SNAPSHOT_INVALID',
    message,
    hint: 'Build again. If it keeps happening, check that nothing else writes to the snapshot directory.',
    details: { path },
  });

export const readSnapshotFile = async ({
  snapshotDirectory,
  artifact,
}: {
  snapshotDirectory: string;
  artifact: ToolingArtifact;
}) => {
  const filePath = resolve(snapshotDirectory, artifact.path);

  if (!isInsideDirectory({ filePath, directory: snapshotDirectory })) {
    throw createSnapshotInvalidError({
      message: `The build lists a file outside its snapshot: ${artifact.path}`,
      path: artifact.path,
    });
  }

  const bytes = await openAsBlob(filePath);
  const hash = createHash('sha256');

  try {
    for await (const chunk of readBlobChunks(bytes)) {
      hash.update(chunk);
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'NotReadableError') {
      throw createSnapshotInvalidError({
        message: `${artifact.path} changed after the build.`,
        path: artifact.path,
      });
    }

    throw error;
  }

  const sha256 = hash.digest('hex');

  if (bytes.size !== artifact.size || sha256 !== artifact.sha256) {
    throw createSnapshotInvalidError({
      message: `${artifact.path} changed after the build.`,
      path: artifact.path,
    });
  }

  return bytes;
};
