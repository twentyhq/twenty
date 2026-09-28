import { createHash, randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { isAbsolute, join, relative, sep } from 'node:path';
import {
  type ToolingArtifact,
  type ToolingArtifactRole,
  type ToolingBuildSnapshot,
  type ToolingDiagnostic,
  type ToolingOperationOptions,
  type ToolingResult,
} from '@/tooling/types';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { compileApplication } from '@/cli/utilities/build/common/compile-application';
import { validateAppPath } from '@/tooling/validate-app-path';

const ROLE_BY_FILE_FOLDER: Partial<Record<FileFolder, ToolingArtifactRole>> = {
  [FileFolder.BuiltLogicFunction]: 'built-logic-function',
  [FileFolder.BuiltFrontComponent]: 'built-front-component',
  [FileFolder.Source]: 'source',
  [FileFolder.Dependencies]: 'dependencies',
  [FileFolder.PublicAsset]: 'public-asset',
};

const snapshotDirectories = new Map<string, string>();

export const buildSnapshot = async ({
  appPath,
  signal,
}: ToolingOperationOptions): Promise<ToolingResult<ToolingBuildSnapshot>> => {
  const validation = await validateAppPath(appPath);

  if (!validation.success) {
    return validation;
  }

  let directory: string | undefined;
  const diagnostics: ToolingDiagnostic[] = [];
  const cleanup = async () => {
    if (!isDefined(directory)) {
      return;
    }

    try {
      await rm(directory, { recursive: true, force: true });
    } catch (error) {
      diagnostics.push({
        severity: 'warning',
        code: 'SNAPSHOT_CLEANUP_FAILED',
        message: `Could not remove snapshot ${directory}: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  };

  try {
    signal?.throwIfAborted();
    const buildId = randomUUID();
    const snapshotsDirectory = join(appPath, '.twenty', 'snapshots');

    await mkdir(snapshotsDirectory, { recursive: true });
    directory = await mkdtemp(join(snapshotsDirectory, 'build-'));
    await writeFile(
      join(directory, 'lease.json'),
      JSON.stringify({
        buildId,
        pid: process.pid,
        createdAt: new Date().toISOString(),
      }),
      { flag: 'wx' },
    );

    const filesDirectory = join(directory, 'files');
    const result = await compileApplication({
      appPath,
      outputDir: relative(appPath, filesDirectory),
      dereferenceSymlinks: true,
      signal,
    });

    diagnostics.push(...result.diagnostics);

    if (!result.success) {
      await cleanup();

      return {
        ...result,
        diagnostics,
      };
    }

    const files: ToolingArtifact[] = [];

    for (const file of result.data.builtFileInfos.values()) {
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

    const sortedFiles = files.sort((first, second) =>
      first.path < second.path ? -1 : first.path > second.path ? 1 : 0,
    );
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

    if (typeof packageJson.name !== 'string' || packageJson.name.length === 0) {
      throw new Error('The app package.json must declare a name.');
    }

    signal?.throwIfAborted();
    snapshotDirectories.set(buildId, directory);

    return {
      success: true,
      data: {
        buildId,
        directory: filesDirectory,
        contentHash,
        application: {
          universalIdentifier:
            result.data.manifest.application.universalIdentifier,
          name: packageJson.name,
          displayName: result.data.manifest.application.displayName,
        },
        manifestFormat: 'twenty-application',
        manifest: result.data.manifest,
        files: sortedFiles,
      },
      diagnostics,
    };
  } catch (error) {
    await cleanup();

    return {
      success: false,
      error: {
        code: signal?.aborted ? 'CANCELLED' : 'BUILD_FAILED',
        message: error instanceof Error ? error.message : String(error),
      },
      diagnostics,
    };
  }
};

export const releaseSnapshot = async ({
  buildId,
}: {
  buildId: string;
}): Promise<ToolingResult<null>> => {
  const directory = snapshotDirectories.get(buildId);

  if (!isDefined(directory)) {
    return {
      success: false,
      error: {
        code: 'SNAPSHOT_NOT_FOUND',
        message: 'This tooling instance does not hold the requested snapshot.',
      },
      diagnostics: [],
    };
  }

  try {
    await rm(directory, { recursive: true, force: true });
    snapshotDirectories.delete(buildId);

    return { success: true, data: null, diagnostics: [] };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'SNAPSHOT_RELEASE_FAILED',
        message: error instanceof Error ? error.message : String(error),
      },
      diagnostics: [],
    };
  }
};
