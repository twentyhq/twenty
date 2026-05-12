import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import sharp from 'sharp';

const SHARP_SUPPORTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/tiff',
  'image/avif',
]);

export const sanitizeFile = async ({
  file,
  ext,
  mimeType,
}: {
  file: Buffer | Uint8Array | string;
  ext: string;
  mimeType: string | undefined;
}): Promise<Buffer | Uint8Array | string> => {
  if (ext === 'svg' || mimeType === 'image/svg+xml') {
    const window = new JSDOM('').window;
    const purify = DOMPurify(window);

    let fileString: string;

    if (typeof file === 'string') {
      fileString = file;
    } else if (Buffer.isBuffer(file)) {
      fileString = file.toString('utf-8');
    } else {
      fileString = Buffer.from(file).toString('utf-8');
    }

    return purify.sanitize(fileString);
  }

  if (mimeType && SHARP_SUPPORTED_MIME_TYPES.has(mimeType)) {
    try {
      const inputBuffer = Buffer.isBuffer(file)
        ? file
        : typeof file === 'string'
          ? Buffer.from(file, 'binary')
          : Buffer.from(file);

      // rotate() applies EXIF orientation before metadata is stripped
      return await sharp(inputBuffer).rotate().toBuffer();
    } catch {
      return file;
    }
  }

  return file;
};
