import { sanitizeFile } from 'src/engine/core-modules/file/utils/sanitize-file.utils';

describe('sanitizeFile', () => {
  it('should strip <script> from an SVG string', () => {
    const malicious =
      '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><rect width="10" height="10"/></svg>';

    const sanitized = sanitizeFile({
      file: malicious,
      ext: 'svg',
      mimeType: 'image/svg+xml',
    }) as string;

    expect(sanitized).not.toContain('<script');
    expect(sanitized).not.toContain('alert(1)');
    expect(sanitized).toContain('rect');
  });

  it('should strip event-handler attributes from an SVG', () => {
    const malicious =
      '<svg xmlns="http://www.w3.org/2000/svg"><image href="x" onerror="alert(1)"/></svg>';

    const sanitized = sanitizeFile({
      file: Buffer.from(malicious, 'utf-8'),
      ext: 'svg',
      mimeType: 'image/svg+xml',
    }) as string;

    expect(sanitized).not.toContain('onerror');
    expect(sanitized).not.toContain('alert(1)');
  });

  it('should sanitize when only the mime type indicates SVG', () => {
    const malicious =
      '<svg xmlns="http://www.w3.org/2000/svg"><script>1</script></svg>';

    const sanitized = sanitizeFile({
      file: malicious,
      ext: 'bin',
      mimeType: 'image/svg+xml',
    }) as string;

    expect(sanitized).not.toContain('<script');
  });

  it('should strip EXIF APP1 metadata from a JPEG file', () => {
    const jpegWithExif = Buffer.concat([
      Buffer.from([0xff, 0xd8]),
      Buffer.from([0xff, 0xe1, 0x00, 0x08]),
      Buffer.from('Exif\0\0', 'binary'),
      Buffer.from([0xff, 0xdb, 0x00, 0x04, 0x01, 0x02]),
      Buffer.from([0xff, 0xda, 0x00, 0x02]),
      Buffer.from('scan-data', 'binary'),
      Buffer.from([0xff, 0xd9]),
    ]);

    const sanitized = sanitizeFile({
      file: jpegWithExif,
      ext: 'jpg',
      mimeType: 'image/jpeg',
    }) as Buffer;

    expect(sanitized.includes(Buffer.from('Exif'))).toBe(false);
    expect(sanitized.includes(Buffer.from([0xff, 0xe1]))).toBe(false);
    expect(sanitized.includes(Buffer.from('scan-data'))).toBe(true);
    expect(sanitized[0]).toBe(0xff);
    expect(sanitized[1]).toBe(0xd8);
  });

  it('should strip eXIf metadata chunk from a PNG file', () => {
    const pngSig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const exifChunk = Buffer.from([
      0x00, 0x00, 0x00, 0x04,
      0x65, 0x58, 0x49, 0x66, // 'eXIf'
      0x01, 0x02, 0x03, 0x04,
      0x00, 0x00, 0x00, 0x00,
    ]);
    const idatChunk = Buffer.from([
      0x00, 0x00, 0x00, 0x04,
      0x49, 0x44, 0x41, 0x54, // 'IDAT'
      0x11, 0x22, 0x33, 0x44,
      0x00, 0x00, 0x00, 0x00,
    ]);
    const iendChunk = Buffer.from([
      0x00, 0x00, 0x00, 0x00,
      0x49, 0x45, 0x4e, 0x44, // 'IEND'
      0xae, 0x42, 0x60, 0x82,
    ]);

    const pngWithExif = Buffer.concat([pngSig, exifChunk, idatChunk, iendChunk]);

    const sanitized = sanitizeFile({
      file: pngWithExif,
      ext: 'png',
      mimeType: 'image/png',
    }) as Buffer;

    expect(sanitized.includes(Buffer.from('eXIf'))).toBe(false);
    expect(sanitized.includes(Buffer.from('IDAT'))).toBe(true);
    expect(sanitized.includes(Buffer.from('IEND'))).toBe(true);
  });

  it('should return non-image files unchanged', () => {
    const file = Buffer.from('plain text file content');

    const result = sanitizeFile({
      file,
      ext: 'txt',
      mimeType: 'text/plain',
    });

    expect(result).toBe(file);
  });
});
