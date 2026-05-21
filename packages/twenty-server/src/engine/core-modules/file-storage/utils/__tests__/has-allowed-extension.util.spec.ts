import { hasAllowedExtension } from 'src/engine/core-modules/file-storage/utils/has-allowed-extension.util';

describe('hasAllowedExtension', () => {
  const allowedExtensions = {
    '.mjs': true,
    '.ts': true,
    '.tsx': true,
  } as const;

  it('should return true for an allowed extension', () => {
    expect(hasAllowedExtension('index.mjs', allowedExtensions)).toBe(true);
    expect(hasAllowedExtension('handler.ts', allowedExtensions)).toBe(true);
    expect(hasAllowedExtension('component.tsx', allowedExtensions)).toBe(true);
  });

  it('should return true for nested paths with allowed extensions', () => {
    expect(
      hasAllowedExtension('src/handlers/index.mjs', allowedExtensions),
    ).toBe(true);
    expect(
      hasAllowedExtension('src/deep/nested/path/file.ts', allowedExtensions),
    ).toBe(true);
  });

  it('should return false for disallowed extensions', () => {
    expect(hasAllowedExtension('index.js', allowedExtensions)).toBe(false);
    expect(hasAllowedExtension('index.html', allowedExtensions)).toBe(false);
    expect(hasAllowedExtension('script.sh', allowedExtensions)).toBe(false);
  });

  it('should return false for files with no extension', () => {
    expect(hasAllowedExtension('Makefile', allowedExtensions)).toBe(false);
    expect(hasAllowedExtension('README', allowedExtensions)).toBe(false);
  });

  it('should be case-insensitive', () => {
    expect(hasAllowedExtension('index.MJS', allowedExtensions)).toBe(true);
    expect(hasAllowedExtension('handler.TS', allowedExtensions)).toBe(true);
    expect(hasAllowedExtension('component.TSX', allowedExtensions)).toBe(true);
  });

  it('should use the last extension for double extensions', () => {
    expect(
      hasAllowedExtension('archive.tar.gz', { '.gz': true }),
    ).toBe(true);
    expect(
      hasAllowedExtension('archive.tar.gz', { '.tar': true }),
    ).toBe(false);
  });

  it('should return false for empty file path', () => {
    expect(hasAllowedExtension('', allowedExtensions)).toBe(false);
  });
});
