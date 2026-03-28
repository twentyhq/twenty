import { type Response } from 'express';

import { getContentDisposition } from 'src/engine/core-modules/file/utils/get-content-disposition.utils';

export const setFileResponseHeaders = (res: Response, mimeType: string) => {
  const contentType = mimeType || 'application/octet-stream';

  res.setHeader('Content-Type', contentType);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Disposition', getContentDisposition(contentType));
};
