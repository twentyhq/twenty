import { t } from '@lingui/core/macro';
import { type FileFolder, type ServerFileFolder } from 'twenty-shared/types';

import { ALLOWED_EXTENSIONS_BY_APPLICATION_FILE_FOLDER } from 'src/engine/core-modules/file-storage/constants/allowed-extensions-by-application-file-folder.constant';
import { type ResourcePathValidationResult } from 'src/engine/core-modules/file-storage/types/resource-path-validation-result.type';
import { hasAllowedExtension } from 'src/engine/core-modules/file-storage/utils/has-allowed-extension.util';

export const validateFileExtension = ({
  resourcePath,
  fileFolder,
}: {
  resourcePath: string;
  fileFolder: FileFolder | ServerFileFolder;
}): ResourcePathValidationResult => {
  const allowedExtensions =
    ALLOWED_EXTENSIONS_BY_APPLICATION_FILE_FOLDER[
      fileFolder as keyof typeof ALLOWED_EXTENSIONS_BY_APPLICATION_FILE_FOLDER
    ];

  if (!allowedExtensions) {
    return { isValid: true };
  }

  if (
    !hasAllowedExtension({
      filePath: resourcePath,
      allowedExtensions,
    })
  ) {
    return {
      isValid: false,
      error: t`Invalid file extension. Allowed extensions: ${Object.keys(allowedExtensions).join(', ')}`,
    };
  }

  return { isValid: true };
};
