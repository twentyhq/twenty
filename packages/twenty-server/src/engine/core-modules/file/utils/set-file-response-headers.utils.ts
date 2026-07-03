import { type Response } from 'express';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getContentDisposition } from 'src/engine/core-modules/file/utils/get-content-disposition.utils';

const CACHEABLE_PICTURE_FILE_FOLDERS: FileFolder[] = [FileFolder.CorePicture];

const PICTURE_CACHE_CONTROL = 'private, max-age=86400, immutable';

export const setFileResponseHeaders = (
  res: Response,
  mimeType: string,
  fileFolder?: FileFolder,
) => {
  const contentType = mimeType || 'application/octet-stream';

  res.setHeader('Content-Type', contentType);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Disposition', getContentDisposition(contentType));

  if (
    isDefined(fileFolder) &&
    CACHEABLE_PICTURE_FILE_FOLDERS.includes(fileFolder)
  ) {
    res.setHeader('Cache-Control', PICTURE_CACHE_CONTROL);
  }
};
