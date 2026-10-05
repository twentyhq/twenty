import { hashContent } from '@/utils/hash-content';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { type ToolingArtifact } from '@/app/types/tooling-result.type';
import { CliError } from '@/output/cli-error';
import { isInsideDirectory } from '@/utils/is-inside-directory';

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

  const bytes = await readFile(filePath);
  const sha256 = hashContent(bytes);

  if (bytes.length !== artifact.size || sha256 !== artifact.sha256) {
    throw createSnapshotInvalidError({
      message: `${artifact.path} changed after the build.`,
      path: artifact.path,
    });
  }

  return new Uint8Array(bytes);
};
