import { randomUUID } from 'node:crypto';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { isDefined } from 'twenty-shared/utils';

import {
  type BuildSnapshot,
  type BuildDiagnostic,
  type BuildOperationOptions,
  type BuildResult,
} from '@/application-build/types';
import { compileApplication } from '@/cli/utilities/build/common/compile-application';
import { collectBuildSnapshot } from '@/application-build/collect-build-snapshot';
import { validateAppPath } from '@/application-build/validate-app-path';

const snapshotDirectories = new Map<string, string>();

export const buildSnapshot = async ({
  appPath,
  signal,
}: BuildOperationOptions): Promise<BuildResult<BuildSnapshot>> => {
  const validation = await validateAppPath(appPath);

  if (!validation.success) {
    return validation;
  }

  let snapshotDirectory: string | undefined;
  const diagnostics: BuildDiagnostic[] = [];
  const cleanupSnapshot = async () => {
    if (!isDefined(snapshotDirectory)) {
      return;
    }

    try {
      await rm(snapshotDirectory, { recursive: true, force: true });
    } catch (error) {
      diagnostics.push({
        severity: 'warning',
        code: 'SNAPSHOT_CLEANUP_FAILED',
        message: `Could not remove snapshot ${snapshotDirectory}: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  };

  try {
    signal?.throwIfAborted();
    const buildId = randomUUID();
    const snapshotsDirectory = join(appPath, '.twenty', 'snapshots');

    await mkdir(snapshotsDirectory, { recursive: true });
    snapshotDirectory = await mkdtemp(join(snapshotsDirectory, 'build-'));
    await writeFile(
      join(snapshotDirectory, 'lease.json'),
      JSON.stringify({
        buildId,
        pid: process.pid,
        createdAt: new Date().toISOString(),
      }),
      { flag: 'wx' },
    );

    const filesDirectory = join(snapshotDirectory, 'files');
    const result = await compileApplication({
      appPath,
      outputDir: relative(appPath, filesDirectory),
      dereferenceSymlinks: true,
      signal,
    });

    diagnostics.push(...result.diagnostics);

    if (!result.success) {
      await cleanupSnapshot();

      return {
        ...result,
        diagnostics,
      };
    }

    const snapshot = await collectBuildSnapshot({
      appPath,
      buildId,
      filesDirectory,
      manifest: result.data.manifest,
      builtFileInfos: result.data.builtFileInfos,
      signal,
    });

    signal?.throwIfAborted();
    snapshotDirectories.set(buildId, snapshotDirectory);

    return {
      success: true,
      data: snapshot,
      diagnostics,
    };
  } catch (error) {
    await cleanupSnapshot();

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
}): Promise<BuildResult<null>> => {
  const snapshotDirectory = snapshotDirectories.get(buildId);

  if (!isDefined(snapshotDirectory)) {
    return {
      success: false,
      error: {
        code: 'SNAPSHOT_NOT_FOUND',
        message: 'This SDK instance does not hold the requested snapshot.',
      },
      diagnostics: [],
    };
  }

  try {
    await rm(snapshotDirectory, { recursive: true, force: true });
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
