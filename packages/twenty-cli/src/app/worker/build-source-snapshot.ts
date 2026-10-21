import { stop } from 'esbuild';

import { getToolingErrorContext } from '@/app/get-tooling-error-context';
import { resolveSourceSdk } from '@/app/project/resolve-source-sdk';
import { buildSnapshot, releaseSnapshot } from '@/app/snapshots/build-snapshot';
import {
  type ToolingBuild,
  type ToolingResult,
} from '@/app/types/tooling-result.type';
import { CliError } from '@/output/cli-error';

export const buildSourceSnapshot = async ({
  appPath,
  signal,
}: {
  appPath: string;
  signal: AbortSignal;
}): Promise<ToolingResult<ToolingBuild>> => {
  try {
    signal.throwIfAborted();
    await resolveSourceSdk({ appPath });

    return await buildSnapshot({ appPath, signal });
  } catch (error) {
    return {
      success: false,
      error: {
        code: signal.aborted
          ? 'CANCELLED'
          : error instanceof CliError
            ? error.code
            : 'BUILD_FAILED',
        message: error instanceof Error ? error.message : String(error),
        ...getToolingErrorContext(error),
      },
      diagnostics: [],
    };
  } finally {
    await stop();
  }
};

export const releaseSourceSnapshot = releaseSnapshot;
