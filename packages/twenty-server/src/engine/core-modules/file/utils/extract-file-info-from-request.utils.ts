import { Request } from 'express';

import { fileFolderConfigs } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { checkFileFolder } from 'src/engine/core-modules/file/utils/check-file-folder.utils';
import { checkFilename } from 'src/engine/core-modules/file/utils/check-file-name.utils';

export const extractFileInfoFromRequest = (request: Request) => {
  const filename = checkFilename(request.params.filename);

  const parts = request.params[0].split('/');

  const fileSignature = parts.pop();

  const rawFolder = parts.join('/');

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
