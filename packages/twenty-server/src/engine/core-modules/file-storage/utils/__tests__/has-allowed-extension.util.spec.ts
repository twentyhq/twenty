import { hasAllowedExtension } from 'src/engine/core-modules/file-storage/utils/has-allowed-extension.util';

describe('hasAllowedExtension', () => {
  const allowedExtensions = {
    '.mjs': true,
    '.ts': true,
    '.tsx': true,
  } as const;

  it('should return true for an allowed extension', () => {
    expect(
      hasAllowedExtension({ filePath: 'index.mjs', allowedExtensions }),
    ).toBe(true);
    expect(
      hasAllowedExtension({ filePath: 'handler.ts', allowedExtensions }),
    ).toBe(true);
    expect(
      hasAllowedExtension({ filePath: 'component.tsx', allowedExtensions }),
    ).toBe(true);
  });

  it('should return true for nested paths with allowed extensions', () => {
    expect(
      hasAllowedExtension({
        filePath: 'src/handlers/index.mjs',
        allowedExtensions,
      }),
    ).toBe(true);
    expect(
      hasAllowedExtension({
        filePath: 'src/deep/nested/path/file.ts',
        allowedExtensions,
      }),
    ).toBe(true);
  });

  it('should return false for disallowed extensions', () => {
    expect(
      hasAllowedExtension({ filePath: 'index.js', allowedExtensions }),
    ).toBe(false);
    expect(
      hasAllowedExtension({ filePath: 'index.html', allowedExtensions }),
    ).toBe(false);
    expect(
      hasAllowedExtension({ filePath: 'script.sh', allowedExtensions }),
    ).toBe(false);
  });

  it('should return false for files with no extension', () => {
    expect(
      hasAllowedExtension({ filePath: 'Makefile', allowedExtensions }),
    ).toBe(false);
    expect(hasAllowedExtension({ filePath: 'README', allowedExtensions })).toBe(
      false,
    );
  });

  it('should be case-insensitive', () => {
    expect(
      hasAllowedExtension({ filePath: 'index.MJS', allowedExtensions }),
    ).toBe(true);
    expect(
      hasAllowedExtension({ filePath: 'handler.TS', allowedExtensions }),
    ).toBe(true);
    expect(
      hasAllowedExtension({ filePath: 'component.TSX', allowedExtensions }),
    ).toBe(true);
  });

  it('should use the last extension for double extensions', () => {
    expect(
      hasAllowedExtension({
        filePath: 'archive.tar.gz',
        allowedExtensions: { '.gz': true },
      }),
    ).toBe(true);
    expect(
      hasAllowedExtension({
        filePath: 'archive.tar.gz',
        allowedExtensions: { '.tar': true },
      }),
    ).toBe(false);
  });

  it('should return false for empty file path', () => {
    expect(hasAllowedExtension({ filePath: '', allowedExtensions })).toBe(
      false,
    );
  });
});
