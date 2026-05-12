import { msg } from '@lingui/core/macro';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import sharp from 'sharp';

import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

const SHARP_SUPPORTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/tiff',
  'image/avif',
]);

const isBufferLike = (
  file: Buffer | Uint8Array | string,
): file is Buffer | Uint8Array => typeof file !== 'string';

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

  if (
    mimeType &&
    SHARP_SUPPORTED_MIME_TYPES.has(mimeType) &&
    isBufferLike(file)
  ) {
    try {
      const inputBuffer = Buffer.isBuffer(file) ? file : Buffer.from(file);

      // rotate() applies EXIF orientation before metadata is stripped
      return await sharp(inputBuffer).rotate().toBuffer();
    } catch (error) {
      throw new FileStorageException(
        `Failed to sanitize image metadata: ${error instanceof Error ? error.message : String(error)}`,
        FileStorageExceptionCode.SANITIZATION_FAILED,
        {
          userFriendlyMessage: msg`The image file could not be processed. It may be corrupted or in an unsupported format.`,
        },
      );
    }
  }

  return file;
};
