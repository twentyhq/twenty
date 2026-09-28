import { OUTPUT_DIR, type Manifest } from 'twenty-shared/application';
import { type ToolingDiagnostic, type ToolingResult } from '@/tooling/types';

import {
  buildApplication,
  type BuiltFileInfo,
} from '@/cli/utilities/build/common/build-application';
import { applyGeneratedCover } from '@/cli/utilities/build/cover/apply-generated-cover';
import { buildAndValidateManifest } from '@/cli/utilities/build/manifest/build-and-validate-manifest';
import { manifestUpdateChecksums } from '@/cli/utilities/build/manifest/manifest-update-checksums';
import { writeManifestToOutput } from '@/cli/utilities/build/manifest/manifest-writer';
import { compileApplicationTranslations } from '@/cli/utilities/translations/compile-application-translations';
import { typecheckApplication } from '@/tooling/typecheck-application';

export const compileApplication = async ({
  appPath,
  outputDir = OUTPUT_DIR,
  dereferenceSymlinks = false,
  onProgress,
  onTranslationWarning,
  signal,
  typecheck = typecheckApplication,
}: {
  appPath: string;
  outputDir?: string;
  dereferenceSymlinks?: boolean;
  onProgress?: (message: string) => void;
  onTranslationWarning?: (message: string) => void;
  signal?: AbortSignal;
  typecheck?: typeof typecheckApplication;
}): Promise<
  ToolingResult<{
    manifest: Manifest;
    builtFileInfos: Map<string, BuiltFileInfo>;
  }>
> => {
  const diagnostics: ToolingDiagnostic[] = [];
  const warn = (message: string) => {
    diagnostics.push({ severity: 'warning', code: 'BUILD_WARNING', message });
    onProgress?.(`⚠ ${message}`);
  };

  signal?.throwIfAborted();
  onProgress?.('Building manifest...');
  const manifestResult = await buildAndValidateManifest(appPath);

  if (!manifestResult.success) {
    return {
      success: false,
      error: {
        code: 'MANIFEST_BUILD_FAILED',
        message: manifestResult.errors.join('\n'),
      },
      diagnostics: manifestResult.errors.map((message) => ({
        severity: 'error',
        code: 'MANIFEST_BUILD_FAILED',
        message,
      })),
    };
  }

  manifestResult.warnings.forEach(warn);

  signal?.throwIfAborted();
  const { manifest, generatedAssets } = await applyGeneratedCover({
    appPath,
    manifest: manifestResult.manifest,
  }).catch((error) => {
    warn(
      `Skipped cover image generation: ${error instanceof Error ? error.message : String(error)}`,
    );

    return { manifest: manifestResult.manifest, generatedAssets: [] };
  });

  if (generatedAssets.length > 0) {
    onProgress?.('Generated cover image from logo');
  }

  const translations = await compileApplicationTranslations(
    appPath,
    onTranslationWarning ?? warn,
  );

  signal?.throwIfAborted();
  onProgress?.('Building application files...');
  const { builtFileInfos } = await buildApplication({
    appPath,
    manifest,
    filePaths: manifestResult.filePaths,
    generatedAssets,
    outputDir,
    dereferenceSymlinks,
  });

  onProgress?.('Running typecheck...');
  const typecheckResult = await typecheck({ appPath, signal });

  diagnostics.push(...typecheckResult.diagnostics);

  if (!typecheckResult.success) {
    return { ...typecheckResult, diagnostics };
  }

  const updatedManifest = {
    ...manifestUpdateChecksums({ manifest, builtFileInfos, outputDir }),
    translations,
  };

  await writeManifestToOutput(appPath, updatedManifest, outputDir);

  return {
    success: true,
    data: { manifest: updatedManifest, builtFileInfos },
    diagnostics,
  };
};
