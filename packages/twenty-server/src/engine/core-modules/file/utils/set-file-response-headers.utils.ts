import { type Response } from 'express';
import { basename } from 'path';

const INLINE_SAFE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/bmp',
  'image/tiff',
  'application/pdf',
  'text/plain',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'video/mp4',
  'video/webm',
  'video/ogg',
]);

export const setFileResponseHeaders = (
  res: Response,
  {
    mimeType,
    filename,
  }: {
    mimeType: string;
    filename?: string;
  },
) => {
  const contentType = mimeType || 'application/octet-stream';
  const disposition = INLINE_SAFE_MIME_TYPES.has(contentType)
    ? 'inline'
    : 'attachment';

  res.setHeader('Content-Type', contentType);
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (filename) {
    const sanitizedFilename = basename(filename).replace(/"/g, '\\"');

    res.setHeader(
      'Content-Disposition',
      `${disposition}; filename="${sanitizedFilename}"`,
    );
  } else {
    res.setHeader('Content-Disposition', disposition);
  }
};
