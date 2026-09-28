import { isNonEmptyString } from '@sniptt/guards';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { isAbsolute, join, relative, sep } from 'node:path';
import { type Manifest } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type BuiltFileInfo } from '@/cli/utilities/build/common/build-application';
import {
  type BuildArtifact,
  type BuildArtifactRole,
  type BuildSnapshot,
} from '@/application-build/types';

const ROLE_BY_FILE_FOLDER: Partial<Record<FileFolder, BuildArtifactRole>> = {
  [FileFolder.BuiltLogicFunction]: 'built-logic-function',
  [FileFolder.BuiltFrontComponent]: 'built-front-component',
  [FileFolder.Source]: 'source',
  [FileFolder.Dependencies]: 'dependencies',
  [FileFolder.PublicAsset]: 'public-asset',
};

export const collectBuildSnapshot = async ({
  appPath,
  buildId,
  filesDirectory,
  manifest,
  builtFileInfos,
  signal,
}: {
  appPath: string;
  buildId: string;
  filesDirectory: string;
  manifest: Manifest;
  builtFileInfos: Map<string, BuiltFileInfo>;
  signal?: AbortSignal;
}): Promise<BuildSnapshot> => {
  const files: BuildArtifact[] = [];

  for (const file of builtFileInfos.values()) {
    signal?.throwIfAborted();
    const absolutePath = join(appPath, file.builtPath);
    const filePath = relative(filesDirectory, absolutePath);
    const role = ROLE_BY_FILE_FOLDER[file.fileFolder];

    if (
      !isDefined(role) ||
      isAbsolute(filePath) ||
      filePath === '..' ||
      filePath.startsWith(`..${sep}`)
    ) {
      throw new Error(`Invalid snapshot artifact: ${file.builtPath}`);
    }

    const hash = createHash('sha256');
    let size = 0;

    for await (const chunk of createReadStream(absolutePath, { signal })) {
      hash.update(chunk);
      size += chunk.length;
    }

    files.push({
      path: filePath.split(sep).join('/'),
      sourcePath: file.sourcePath.split(sep).join('/'),
      role,
      size,
      sha256: hash.digest('hex'),
    });
  }

  const sortedFiles = files.sort((first, second) => {
    if (first.path < second.path) {
      return -1;
    }

    if (first.path > second.path) {
      return 1;
    }

    return 0;
  });
  const manifestBytes = await readFile(join(filesDirectory, 'manifest.json'));
  const contentHash = createHash('sha256')
    .update(
      JSON.stringify(
        sortedFiles.map(({ path, role, sha256 }) => ({ path, role, sha256 })),
      ),
    )
    .update('\n')
    .update(manifestBytes)
    .digest('hex');
  const packageJson: { name?: unknown } = JSON.parse(
    await readFile(join(filesDirectory, 'package.json'), 'utf8'),
  );

  if (!isNonEmptyString(packageJson.name)) {
    throw new Error('The app package.json must declare a name.');
  }

  return {
    buildId,
    directory: filesDirectory,
    contentHash,
    application: {
      universalIdentifier: manifest.application.universalIdentifier,
      name: packageJson.name,
      displayName: manifest.application.displayName,
    },
    manifestFormat: 'twenty-application',
    manifest,
    files: sortedFiles,
  };
};
