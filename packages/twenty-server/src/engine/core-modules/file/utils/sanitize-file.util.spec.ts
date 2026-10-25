import { sanitizeFile } from './sanitize-file.util';

describe('sanitizeFile', () => {
  describe('SVG sanitization', () => {
    it('should strip script tags from SVG files', () => {
      const maliciousSvg =
        '<svg><script>alert("xss")</script><rect width="100" height="100"/></svg>';
      const result = sanitizeFile({
        file: maliciousSvg,
        ext: 'svg',
        mimeType: 'image/svg+xml',
      });

      expect(result).not.toContain('<script>');
      expect(result).toContain('<rect');
    });
  });

  describe('JPEG EXIF stripping', () => {
    it('should strip APP1 EXIF/GPS marker segment from JPEG buffer', () => {
      const app1Payload = Buffer.from([0x45, 0x78, 0x69, 0x66, 0x00, 0x00]);
      const app1Length = app1Payload.length + 2;
      const app1Header = Buffer.from([
        0xff,
        0xe1,
        (app1Length >> 8) & 0xff,
        app1Length & 0xff,
      ]);

      const jpegWithExif = Buffer.concat([
        Buffer.from([0xff, 0xd8]),
        app1Header,
        app1Payload,
        Buffer.from([0xff, 0xd9]),
      ]);

      const result = sanitizeFile({
        file: jpegWithExif,
        ext: 'jpg',
        mimeType: 'image/jpeg',
      }) as Buffer;

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result[0]).toBe(0xff);
      expect(result[1]).toBe(0xd8);
      expect(result[result.length - 2]).toBe(0xff);
      expect(result[result.length - 1]).toBe(0xd9);

      expect(result.includes(Buffer.from([0xff, 0xe1]))).toBe(false);
    });

    it('should preserve JPEG image data without APP1 marker', () => {
      const jpegWithoutExif = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xd9,
      ]);

      const result = sanitizeFile({
        file: jpegWithoutExif,
        ext: 'jpeg',
        mimeType: 'image/jpeg',
      }) as Buffer;

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.equals(jpegWithoutExif)).toBe(true);
    });
  });

  describe('Other file types', () => {
    it('should return non-SVG, non-JPEG files untouched', () => {
      const textBuffer = Buffer.from('plain text content');
      const result = sanitizeFile({
        file: textBuffer,
        ext: 'txt',
        mimeType: 'text/plain',
      });

      expect(result).toBe(textBuffer);
    });
  });
});
