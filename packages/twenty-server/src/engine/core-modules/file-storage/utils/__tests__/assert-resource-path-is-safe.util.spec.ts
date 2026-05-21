import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

import { assertResourcePathIsSafe } from 'src/engine/core-modules/file-storage/utils/assert-resource-path-is-safe.util';

describe('assertResourcePathIsSafe', () => {
  it('should accept valid relative paths', () => {
    expect(() =>
      assertResourcePathIsSafe('src/components/test.mjs'),
    ).not.toThrow();
    expect(() => assertResourcePathIsSafe('file.mjs')).not.toThrow();
    expect(() => assertResourcePathIsSafe('a/b/c/d.txt')).not.toThrow();
  });

  it('should reject paths with .. traversal', () => {
    expect(() => assertResourcePathIsSafe('../../../other-ws/file.js')).toThrow(
      expect.objectContaining({
        code: FileStorageExceptionCode.ACCESS_DENIED,
      }),
    );
  });

  it('should reject absolute paths', () => {
    expect(() => assertResourcePathIsSafe('/etc/passwd')).toThrow(
      expect.objectContaining({
        code: FileStorageExceptionCode.ACCESS_DENIED,
      }),
    );
  });

  it('should reject paths with null bytes', () => {
    expect(() => assertResourcePathIsSafe('file\0.txt')).toThrow(
      expect.objectContaining({
        code: FileStorageExceptionCode.ACCESS_DENIED,
      }),
    );
  });

  it('should reject paths with backslashes', () => {
    expect(() => assertResourcePathIsSafe('..\\..\\etc\\passwd')).toThrow(
      expect.objectContaining({
        code: FileStorageExceptionCode.ACCESS_DENIED,
      }),
    );
  });
});
