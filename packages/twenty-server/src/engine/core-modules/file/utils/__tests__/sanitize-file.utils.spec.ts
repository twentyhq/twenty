import sharp from 'sharp';

import { FileStorageException } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

import { sanitizeFile } from '../sanitize-file.utils';

// Minimal valid 1x1 JPEG with an EXIF block containing a UserComment tag
const createJpegWithExif = async (): Promise<Buffer> => {
  return sharp({
    create: { width: 1, height: 1, channels: 3, background: '#ff0000' },
  })
    .jpeg()
    .withMetadata({
      exif: {
        IFD0: { ImageDescription: 'sensitive-location-data' },
      },
    })
    .toBuffer();
};

describe('sanitizeFile', () => {
  describe('raster image EXIF stripping', () => {
    it('should strip EXIF metadata from JPEG files', async () => {
      const jpegWithExif = await createJpegWithExif();

      const originalMetadata = await sharp(jpegWithExif).metadata();

      expect(originalMetadata.exif).toBeDefined();

      const sanitized = await sanitizeFile({
        file: jpegWithExif,
        ext: 'jpg',
        mimeType: 'image/jpeg',
      });

      expect(Buffer.isBuffer(sanitized)).toBe(true);

      const sanitizedMetadata = await sharp(sanitized as Buffer).metadata();

      expect(sanitizedMetadata.exif).toBeUndefined();
    });

    it('should strip EXIF metadata from PNG files', async () => {
      const pngWithExif = await sharp({
        create: { width: 1, height: 1, channels: 3, background: '#00ff00' },
      })
        .png()
        .withMetadata({
          exif: {
            IFD0: { ImageDescription: 'test-metadata' },
          },
        })
        .toBuffer();

      const sanitized = await sanitizeFile({
        file: pngWithExif,
        ext: 'png',
        mimeType: 'image/png',
      });

      expect(Buffer.isBuffer(sanitized)).toBe(true);

      const sanitizedMetadata = await sharp(sanitized as Buffer).metadata();

      expect(sanitizedMetadata.exif).toBeUndefined();
    });

    it('should throw a FileStorageException when sharp cannot process a corrupted image', async () => {
      const corruptedBuffer = Buffer.from('not-a-real-image');

      await expect(
        sanitizeFile({
          file: corruptedBuffer,
          ext: 'jpg',
          mimeType: 'image/jpeg',
        }),
      ).rejects.toThrow(FileStorageException);
    });
  });

  describe('SVG sanitization', () => {
    it('should sanitize SVG files with DOMPurify', async () => {
      const maliciousSvg =
        '<svg><script>alert("xss")</script><circle r="10"/></svg>';

      const result = await sanitizeFile({
        file: maliciousSvg,
        ext: 'svg',
        mimeType: 'image/svg+xml',
      });

      expect(typeof result).toBe('string');
      expect(result).not.toContain('<script>');
      expect(result).toContain('<circle');
    });

    it('should handle SVG passed as Buffer', async () => {
      const svgBuffer = Buffer.from(
        '<svg><script>alert("xss")</script><rect/></svg>',
      );

      const result = await sanitizeFile({
        file: svgBuffer,
        ext: 'svg',
        mimeType: 'image/svg+xml',
      });

      expect(typeof result).toBe('string');
      expect(result).not.toContain('<script>');
    });
  });

  describe('non-image files', () => {
    it('should pass through non-image files unmodified', async () => {
      const textContent = Buffer.from('plain text content');

      const result = await sanitizeFile({
        file: textContent,
        ext: 'txt',
        mimeType: 'text/plain',
      });

      expect(result).toBe(textContent);
    });

    it('should pass through PDF files unmodified', async () => {
      const pdfContent = Buffer.from('%PDF-1.4 fake pdf content');

      const result = await sanitizeFile({
        file: pdfContent,
        ext: 'pdf',
        mimeType: 'application/pdf',
      });

      expect(result).toBe(pdfContent);
    });

    it('should pass through files with undefined mime type', async () => {
      const unknownContent = Buffer.from('unknown content');

      const result = await sanitizeFile({
        file: unknownContent,
        ext: 'bin',
        mimeType: undefined,
      });

      expect(result).toBe(unknownContent);
    });
  });
});
