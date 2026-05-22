import { type FileFolder } from 'twenty-shared/types';

import { type ResourcePathValidationResult } from 'src/engine/core-modules/file-storage/types/resource-path-validation-result.type';
import { validateFilenameIntegrity } from 'src/engine/core-modules/file-storage/utils/validate-filename-integrity.util';
import { validateResourceExtension } from 'src/engine/core-modules/file-storage/utils/validate-resource-extension.util';
import { validateSafeRelativePath } from 'src/engine/core-modules/file-storage/utils/validate-safe-relative-path.util';

export const validateResourcePath = ({
  resourcePath,
  fileFolder,
}: {
  resourcePath: string;
  fileFolder: FileFolder;
}): ResourcePathValidationResult => {
  const safePathResult = validateSafeRelativePath({ resourcePath });

  if (!safePathResult.isValid) {
    return safePathResult;
  }

  const integrityResult = validateFilenameIntegrity({ resourcePath });

  if (!integrityResult.isValid) {
    return integrityResult;
  }

  return validateResourceExtension({ resourcePath, fileFolder });
};
