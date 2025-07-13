import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { FILE_PATH_CONSTANTS } from 'src/engine/core-modules/file/constants/file-path.constants';

export const extractRelativePath = (fullPath: string): string => {
  const urlWithTokenMatch = fullPath.match(
    FILE_PATH_CONSTANTS.FILES_WITH_TOKEN_PATTERN,
  );

  if (urlWithTokenMatch) {
    return `${FileFolder.Attachment}/${urlWithTokenMatch[1]}`;
  }

  const urlMatch = fullPath.match(FILE_PATH_CONSTANTS.FILES_PATTERN);

  if (urlMatch) {
    return urlMatch[1];
  }

  const absMatch = fullPath.match(FILE_PATH_CONSTANTS.ATTACHMENT_PATTERN);

  if (absMatch) {
    return absMatch[0];
  }

  return fullPath;
};
