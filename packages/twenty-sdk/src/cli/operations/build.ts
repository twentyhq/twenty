import { execSync } from 'child_process';
import path from 'path';

import { compileApplication } from '@/cli/utilities/build/common/compile-application';
import { runTypecheck } from '@/cli/utilities/build/common/typecheck-plugin';
import { runSafe } from '@/cli/utilities/run-safe';
import { APP_ERROR_CODES, type CommandResult } from '@/cli/types';
import { type BuildErrorCode } from '@/application-build/types';

const COMPILATION_ERROR_CODE_MAP: Partial<Record<BuildErrorCode, string>> = {
  MANIFEST_BUILD_FAILED: APP_ERROR_CODES.MANIFEST_BUILD_FAILED,
  TYPECHECK_FAILED: APP_ERROR_CODES.TYPECHECK_FAILED,
};

export type AppBuildOptions = {
  appPath: string;
  tarball?: boolean;
  onProgress?: (message: string) => void;
};

export type AppBuildResult = {
  outputDir: string;
  fileCount: number;
  tarballPath?: string;
};

const innerAppBuild = async (
  options: AppBuildOptions,
): Promise<CommandResult<AppBuildResult>> => {
  const { appPath, onProgress } = options;

  const compilation = await compileApplication({
    appPath,
    onProgress,
    onTranslationWarning: (message) => console.warn(message),
    typecheck: async () => {
      const typecheckErrors = await runTypecheck(appPath);

      if (typecheckErrors.length > 0) {
        const errorMessages = typecheckErrors.map(
          (error) =>
            `${error.file}(${error.line},${error.column + 1}): ${error.text}`,
        );

        return {
          success: false,
          error: {
            code: 'TYPECHECK_FAILED',
            message: `Typecheck failed:\n${errorMessages.join('\n')}`,
          },
          diagnostics: [],
        };
      }

      return { success: true, data: null, diagnostics: [] };
    },
  });

  if (!compilation.success) {
    return {
      success: false,
      error: {
        code:
          COMPILATION_ERROR_CODE_MAP[compilation.error.code] ??
          APP_ERROR_CODES.BUILD_FAILED,
        message: compilation.error.message,
      },
    };
  }

  const outputDir = path.join(appPath, '.twenty', 'output');

  const result: AppBuildResult = {
    outputDir,
    fileCount: compilation.data.builtFileInfos.size,
  };

  if (options.tarball) {
    onProgress?.('Packing tarball...');

    const packOutput = execSync('npm pack --pack-destination .', {
      cwd: outputDir,
      encoding: 'utf-8',
    }).trim();

    const tarballName = packOutput.split('\n').pop()!;

    result.tarballPath = path.join(outputDir, tarballName);
  }

  return { success: true, data: result };
};

export const appBuild = (
  options: AppBuildOptions,
): Promise<CommandResult<AppBuildResult>> =>
  runSafe(() => innerAppBuild(options), APP_ERROR_CODES.BUILD_FAILED);
