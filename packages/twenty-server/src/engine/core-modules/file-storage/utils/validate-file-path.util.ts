import { t } from '@lingui/core/macro';
import { type FileFolder, type ServerFileFolder } from 'twenty-shared/types';

import { type ResourcePathValidationResult } from 'src/engine/core-modules/file-storage/types/resource-path-validation-result.type';
import { validateFileExtension } from 'src/engine/core-modules/file-storage/utils/validate-file-extension.util';
import { validatePathSegmentsSafety } from 'src/engine/core-modules/file-storage/utils/validate-path-segments-safety.util';
import { validateSafeRelativePath } from 'src/engine/core-modules/file-storage/utils/validate-safe-relative-path.util';

export const validateFilePath = ({
  resourcePath,
  fileFolder,
}: {
  resourcePath: string;
  fileFolder: FileFolder | ServerFileFolder;
}): ResourcePathValidationResult => {
  const safePathResult = validateSafeRelativePath({ resourcePath });

  if (!safePathResult.isValid) {
    return safePathResult;
  }

  const segmentsSafetyResult = validatePathSegmentsSafety({ resourcePath });

  if (!segmentsSafetyResult.isValid) {
    return segmentsSafetyResult;
  }

  const segments = resourcePath.split('/');
  const filename = segments[segments.length - 1];

  if (!filename.includes('.')) {
    return {
      isValid: false,
      error: t`Filename must have an extension`,
    };
  }

  return validateFileExtension({ resourcePath, fileFolder });
};
