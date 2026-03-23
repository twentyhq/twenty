import { type Response } from 'express';

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
  'image/x-icon',
]);

export const setFileResponseHeaders = (res: Response, mimeType: string) => {
  const contentType = mimeType || 'application/octet-stream';
  const disposition = INLINE_SAFE_MIME_TYPES.has(contentType)
    ? 'inline'
    : 'attachment';

  res.setHeader('Content-Type', contentType);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Disposition', disposition);
};
