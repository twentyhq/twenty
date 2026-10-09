import { randomUUID } from 'node:crypto';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { isDefined } from 'twenty-shared/utils';

import { getToolingErrorContext } from '@/app/get-tooling-error-context';
import {
  type ToolingBuild,
  type ToolingDiagnostic,
  type ToolingResult,
} from '@/app/types/tooling-result.type';
import { compileApplication } from '@/app/bundles/compile-application';
import { collectBuildSnapshot } from '@/app/snapshots/collect-build-snapshot';
import { validateAppPath } from '@/app/snapshots/validate-app-path';
import { CliError } from '@/output/cli-error';

const snapshotDirectories = new Map<string, string>();

export const buildSnapshot = async ({
  appPath,
  signal,
}: {
  appPath: string;
  signal?: AbortSignal;
}): Promise<ToolingResult<ToolingBuild>> => {
  const validation = await validateAppPath(appPath);

  if (!validation.success) {
    return validation;
  }

  let snapshotDirectory: string | undefined;
  const diagnostics: ToolingDiagnostic[] = [];
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
    const snapshotsDirectory = join(appPath, '.twenty', 'cli', 'snapshots');

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
        code: signal?.aborted
          ? 'CANCELLED'
          : error instanceof CliError
            ? error.code
            : 'BUILD_FAILED',
        message: error instanceof Error ? error.message : String(error),
        ...getToolingErrorContext(error),
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
  const snapshotDirectory = snapshotDirectories.get(buildId);

  if (!isDefined(snapshotDirectory)) {
    return {
      success: false,
      error: {
        code: 'SNAPSHOT_NOT_FOUND',
        message: 'This CLI worker does not hold the requested snapshot.',
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
