import { FileFolder } from 'twenty-shared/types';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ALLOWED_EXTENSIONS_BY_APPLICATION_FILE_FOLDER } from 'src/engine/core-modules/file-storage/constants/allowed-extensions-by-application-file-folder.constant';
import { hasAllowedExtension } from 'src/engine/core-modules/file-storage/utils/has-allowed-extension.util';

export const validateApplicationFileExtensionOrThrow = ({
  fileFolder,
  filePath,
}: {
  fileFolder: FileFolder;
  filePath: string;
}): void => {
  const allowedExtensions =
    ALLOWED_EXTENSIONS_BY_APPLICATION_FILE_FOLDER[
      fileFolder as keyof typeof ALLOWED_EXTENSIONS_BY_APPLICATION_FILE_FOLDER
    ];

  if (!allowedExtensions) {
    throw new ApplicationException(
      `No allowed extensions configured for file folder ${fileFolder}`,
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }

  if (
    !hasAllowedExtension({
      filePath,
      allowedExtensions,
    })
  ) {
    throw new ApplicationException(
      `Invalid file extension for ${fileFolder}. Allowed extensions: ${Object.keys(allowedExtensions).join(', ')}`,
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }
};
