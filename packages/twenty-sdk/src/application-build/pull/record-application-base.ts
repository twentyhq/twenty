import { assertPullPaths } from '@/application-build/pull/assert-pull-paths';
import { prepareAppPull } from '@/application-build/pull/prepare-app-pull';
import { createPullBaseWrite } from '@/application-build/pull/target-bound-pull-base';
import { type PullAppOptions } from '@/application-build/pull/types';
import { type BuildResult } from '@/application-build/types';
import { validateAppPath } from '@/application-build/validate-app-path';
import { applyPullWrites } from '@/cli/utilities/pull/apply-pull-writes';

export const recordApplicationBase = async (
  options: PullAppOptions,
): Promise<BuildResult<null>> => {
  const { appPath, signal } = options;
  const validation = await validateAppPath(appPath);

  if (!validation.success) {
    return validation;
  }

  try {
    const { applicationExport, target } = await prepareAppPull(options);
    const finalWrite = createPullBaseWrite({
      target,
      manifest: applicationExport.manifest,
    });

    await assertPullPaths(appPath, [finalWrite.relativePath]);
    signal?.throwIfAborted();
    await applyPullWrites({
      appPath,
      writes: [],
      deletions: [],
      finalWrite,
      signal,
    });

    return { success: true, data: null, diagnostics: [] };
  } catch (error) {
    return {
      success: false,
      error: {
        code:
          signal?.aborted && Object.is(error, signal.reason)
            ? 'CANCELLED'
            : 'BASE_RECORD_FAILED',
        message: error instanceof Error ? error.message : String(error),
      },
      diagnostics: [],
    };
  }
};
