import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

import { validateResourcePathOrThrow } from 'src/engine/core-modules/file-storage/utils/validate-resource-path-or-throw.util';

describe('validateResourcePathOrThrow', () => {
  it('should accept valid relative paths', () => {
    expect(() =>
      validateResourcePathOrThrow({
        resourcePath: 'src/components/test.mjs',
      }),
    ).not.toThrow();
    expect(() =>
      validateResourcePathOrThrow({ resourcePath: 'file.mjs' }),
    ).not.toThrow();
    expect(() =>
      validateResourcePathOrThrow({ resourcePath: 'a/b/c/d.txt' }),
    ).not.toThrow();
  });

  it('should reject paths with .. traversal', () => {
    expect(() =>
      validateResourcePathOrThrow({
        resourcePath: '../../../other-ws/file.js',
      }),
    ).toThrow(
      expect.objectContaining({
        code: FileStorageExceptionCode.ACCESS_DENIED,
      }),
    );
  });

  it('should reject absolute paths', () => {
    expect(() =>
      validateResourcePathOrThrow({ resourcePath: '/etc/passwd' }),
    ).toThrow(
      expect.objectContaining({
        code: FileStorageExceptionCode.ACCESS_DENIED,
      }),
    );
  });

  it('should reject paths with null bytes', () => {
    expect(() =>
      validateResourcePathOrThrow({ resourcePath: 'file\0.txt' }),
    ).toThrow(
      expect.objectContaining({
        code: FileStorageExceptionCode.ACCESS_DENIED,
      }),
    );
  });

  it('should reject paths with backslashes', () => {
    expect(() =>
      validateResourcePathOrThrow({
        resourcePath: '..\\..\\etc\\passwd',
      }),
    ).toThrow(
      expect.objectContaining({
        code: FileStorageExceptionCode.ACCESS_DENIED,
      }),
    );
  });

  it('should reject empty strings', () => {
    expect(() =>
      validateResourcePathOrThrow({ resourcePath: '' }),
    ).toThrow(
      expect.objectContaining({
        code: FileStorageExceptionCode.ACCESS_DENIED,
      }),
    );
  });
});
