import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

import { assertStoragePathIsSafe } from 'src/engine/core-modules/file-storage/utils/assert-storage-path-is-safe.util';

describe('assertStoragePathIsSafe', () => {
  it('should accept valid relative paths', () => {
    expect(() => assertStoragePathIsSafe('folder/file.txt')).not.toThrow();
    expect(() =>
      assertStoragePathIsSafe('workspace-123/profile-picture/avatar.png'),
    ).not.toThrow();
    expect(() => assertStoragePathIsSafe('simple.txt')).not.toThrow();
    expect(() =>
      assertStoragePathIsSafe('a/b/c/d/e/deeply-nested-file.json'),
    ).not.toThrow();
  });

  it('should reject paths with .. traversal segments', () => {
    expect(() => assertStoragePathIsSafe('../etc/passwd')).toThrow(
      expect.objectContaining({
        code: FileStorageExceptionCode.ACCESS_DENIED,
      }),
    );
    expect(() => assertStoragePathIsSafe('folder/../../etc/passwd')).toThrow(
      expect.objectContaining({
        code: FileStorageExceptionCode.ACCESS_DENIED,
      }),
    );
    expect(() => assertStoragePathIsSafe('..')).toThrow(
      expect.objectContaining({
        code: FileStorageExceptionCode.ACCESS_DENIED,
      }),
    );
  });

  it('should reject paths with null bytes', () => {
    expect(() => assertStoragePathIsSafe('file\0.txt')).toThrow(
      expect.objectContaining({
        code: FileStorageExceptionCode.ACCESS_DENIED,
      }),
    );
    expect(() => assertStoragePathIsSafe('folder/\0/file.txt')).toThrow(
      expect.objectContaining({
        code: FileStorageExceptionCode.ACCESS_DENIED,
      }),
    );
  });

  it('should reject absolute paths', () => {
    expect(() => assertStoragePathIsSafe('/etc/passwd')).toThrow(
      expect.objectContaining({
        code: FileStorageExceptionCode.ACCESS_DENIED,
      }),
    );
    expect(() => assertStoragePathIsSafe('/tmp/file.txt')).toThrow(
      expect.objectContaining({
        code: FileStorageExceptionCode.ACCESS_DENIED,
      }),
    );
  });

  it('should handle normalized traversal attempts', () => {
    expect(() => assertStoragePathIsSafe('folder/../../../etc/passwd')).toThrow(
      expect.objectContaining({
        code: FileStorageExceptionCode.ACCESS_DENIED,
      }),
    );
  });

  it('should accept paths with dots that are not traversal', () => {
    expect(() => assertStoragePathIsSafe('.hidden-file')).not.toThrow();
    expect(() => assertStoragePathIsSafe('folder/.gitignore')).not.toThrow();
    expect(() => assertStoragePathIsSafe('file.name.ext')).not.toThrow();
  });
});
