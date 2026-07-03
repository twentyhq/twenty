import { type Response } from 'express';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  fileFolderConfigs,
  IMMUTABLE_FILE_CACHE_CONTROL,
} from 'src/engine/core-modules/file/interfaces/file-folder.interface';
import { getContentDisposition } from 'src/engine/core-modules/file/utils/get-content-disposition.utils';

export const setFileResponseHeaders = (
  res: Response,
  mimeType: string,
  fileFolder?: FileFolder,
) => {
  const contentType = mimeType || 'application/octet-stream';

  res.setHeader('Content-Type', contentType);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Disposition', getContentDisposition(contentType));

  if (isDefined(fileFolder) && fileFolderConfigs[fileFolder].immutable) {
    res.setHeader('Cache-Control', IMMUTABLE_FILE_CACHE_CONTROL);
  }
};
