import { type EntityFilePaths } from '@/cli/utilities/build/manifest/manifest-extract-config';
import { buildManifest } from '@/cli/utilities/build/manifest/manifest-build';
import { manifestValidate } from '@/cli/utilities/build/manifest/manifest-validate';
import { type Manifest } from 'twenty-shared/application';

export type BuildAndValidateManifestSuccess = {
  success: true;
  manifest: Manifest;
  filePaths: EntityFilePaths;
  warnings: string[];
};

export type BuildAndValidateManifestFailure = {
  success: false;
  errors: string[];
};

export type BuildAndValidateManifestResult =
  | BuildAndValidateManifestSuccess
  | BuildAndValidateManifestFailure;

export const buildAndValidateManifest = async (
  appPath: string,
): Promise<BuildAndValidateManifestResult> => {
  const result = await buildManifest(appPath);

  if (result.errors.length > 0 || !result.manifest) {
    return {
      success: false,
      errors:
        result.errors.length > 0
          ? result.errors
          : ['Failed to build manifest.'],
    };
  }

  const validation = manifestValidate(result.manifest);

  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors,
    };
  }

  return {
    success: true,
    manifest: result.manifest,
    filePaths: result.filePaths,
    warnings: validation.warnings,
  };
};
