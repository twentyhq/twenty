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

  it('should return non-SVG files unchanged', () => {
    const file = Buffer.from('not an svg');

    const result = sanitizeFile({
      file,
      ext: 'png',
      mimeType: 'image/png',
    });

    expect(result).toBe(file);
  });
});
