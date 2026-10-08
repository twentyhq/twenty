import { stop } from 'esbuild';

import { getToolingErrorContext } from '@/app/get-tooling-error-context';
import { readApplicationIdentity } from '@/app/source/read-application-identity';
import { type AppSourceIdentity } from '@/app/source/types/app-source-identity.type';
import { type ToolingResult } from '@/app/types/tooling-result.type';
import { CliError } from '@/output/cli-error';

export const readSourceIdentity = async ({
  appPath,
  signal,
}: {
  appPath: string;
  signal: AbortSignal;
}): Promise<ToolingResult<AppSourceIdentity>> => {
  try {
    return {
      success: true,
      data: await readApplicationIdentity({ appPath, signal }),
      diagnostics: [],
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: signal.aborted
          ? 'CANCELLED'
          : error instanceof CliError
            ? error.code
            : 'IDENTITY_READ_FAILED',
        message: error instanceof Error ? error.message : String(error),
        ...getToolingErrorContext(error),
      },
      diagnostics: [],
    };
  } finally {
    await stop();
  }
};
