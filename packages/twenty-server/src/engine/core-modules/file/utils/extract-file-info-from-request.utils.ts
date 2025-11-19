import { type Request } from 'express';

import { fileFolderConfigs } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { checkFileFolder } from 'src/engine/core-modules/file/utils/check-file-folder.utils';
import { checkFilename } from 'src/engine/core-modules/file/utils/check-file-name.utils';

export const extractFileInfoFromRequest = (request: Request) => {
  // Ex: /files/profile-picture/original/TOKEN/file.jpg
  const pathSegments = request.path.split('/').filter((segment) => segment);

  const segments = pathSegments.slice(1);

  const filename = checkFilename(segments[segments.length - 1]);
  const fileSignature = segments[segments.length - 2];
  const folderSegments = segments.slice(0, segments.length - 2);
  const rawFolder = folderSegments.join('/');

  const fileFolder = checkFileFolder(rawFolder);

  const ignoreExpirationToken =
    fileFolderConfigs[fileFolder].ignoreExpirationToken;

  return {
    filename,
    fileSignature,
    rawFolder,
    fileFolder,
    ignoreExpirationToken,
  };
};
