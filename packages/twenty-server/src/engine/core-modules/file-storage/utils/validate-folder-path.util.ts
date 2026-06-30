import { extname } from 'path';

import { t } from '@lingui/core/macro';

import { type ResourcePathValidationResult } from 'src/engine/core-modules/file-storage/types/resource-path-validation-result.type';
import { validatePathSegmentsSafety } from 'src/engine/core-modules/file-storage/utils/validate-path-segments-safety.util';
import { validateSafeRelativePath } from 'src/engine/core-modules/file-storage/utils/validate-safe-relative-path.util';

export const validateFolderPath = ({
  folderPath,
}: {
  folderPath: string;
}): ResourcePathValidationResult => {
  const safePathResult = validateSafeRelativePath({
    resourcePath: folderPath,
  });

  if (!safePathResult.isValid) {
    return safePathResult;
  }

  const segmentsSafetyResult = validatePathSegmentsSafety({
    resourcePath: folderPath,
  });

  if (!segmentsSafetyResult.isValid) {
    return segmentsSafetyResult;
  }

  const extension = extname(folderPath);

  if (extension.length > 0) {
    return {
      isValid: false,
      error: t`Folder path must not contain a file extension — use deleteFile for file paths`,
    };
  }

  return { isValid: true };
};
