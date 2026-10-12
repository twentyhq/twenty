import { type EntityFilePaths } from '@/app/manifest/types/entity-file-paths.type';
import { buildManifest } from '@/app/manifest/manifest-build';
import { manifestValidate } from '@/app/manifest/manifest-validate';
import { validatePackageJsonDependencies } from '@/app/manifest/utils/validate-package-json-dependencies';
import { validateYarnLock } from '@/app/manifest/utils/validate-yarn-lock';
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

  const yarnLockErrors = await validateYarnLock(appPath);

  if (yarnLockErrors.length > 0) {
    return {
      success: false,
      errors: yarnLockErrors,
    };
  }

  const packageJsonWarnings = await validatePackageJsonDependencies(appPath);

  return {
    success: true,
    manifest: result.manifest,
    filePaths: result.filePaths,
    warnings: [
      ...result.warnings,
      ...validation.warnings,
      ...packageJsonWarnings,
    ],
  };
};
