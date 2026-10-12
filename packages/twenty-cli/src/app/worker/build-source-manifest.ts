import { stop } from 'esbuild';

import { getToolingErrorContext } from '@/app/get-tooling-error-context';
import { buildAndValidateManifest } from '@/app/manifest/build-and-validate-manifest';
import { type AppManifest } from '@/app/manifest/types/app-manifest.type';
import { resolveSourceSdk } from '@/app/project/resolve-source-sdk';
import { compileApplicationTranslations } from '@/app/translations/compile-application-translations';
import {
  type ToolingDiagnostic,
  type ToolingResult,
} from '@/app/types/tooling-result.type';
import { CliError } from '@/output/cli-error';

export const buildSourceManifest = async ({
  appPath,
  signal,
}: {
  appPath: string;
  signal: AbortSignal;
}): Promise<ToolingResult<AppManifest>> => {
  const diagnostics: ToolingDiagnostic[] = [];
  const warn = (message: string) => {
    diagnostics.push({ severity: 'warning', code: 'BUILD_WARNING', message });
  };

  try {
    signal.throwIfAborted();
    await resolveSourceSdk({ appPath });
    const result = await buildAndValidateManifest(appPath);

    signal.throwIfAborted();

    if (!result.success) {
      return {
        success: false,
        error: {
          code: 'MANIFEST_BUILD_FAILED',
          message: result.errors.join('\n'),
        },
        diagnostics: result.errors.map((message) => ({
          severity: 'error',
          code: 'MANIFEST_BUILD_FAILED',
          message,
        })),
      };
    }

    result.warnings.forEach(warn);
    const translations = await compileApplicationTranslations({
      appPath,
      onWarning: warn,
    });

    signal.throwIfAborted();

    return {
      success: true,
      data: {
        manifest: { ...result.manifest, translations },
        filePaths: result.filePaths,
      },
      diagnostics,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: signal.aborted
          ? 'CANCELLED'
          : error instanceof CliError
            ? error.code
            : 'MANIFEST_BUILD_FAILED',
        message: error instanceof Error ? error.message : String(error),
        ...getToolingErrorContext(error),
      },
      diagnostics,
    };
  } finally {
    await stop();
  }
};
