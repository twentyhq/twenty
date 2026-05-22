import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

import { validateResourcePathOrThrow } from 'src/engine/core-modules/file-storage/utils/validate-resource-path-or-throw.util';

describe('validateResourcePathOrThrow', () => {
  it.each([
    { title: 'nested relative path', resourcePath: 'src/components/test.mjs' },
    { title: 'simple filename', resourcePath: 'file.mjs' },
    { title: 'deeply nested path', resourcePath: 'a/b/c/d.txt' },
  ])(
    'should accept valid relative path: $title',
    ({ resourcePath }) => {
      expect(() =>
        validateResourcePathOrThrow({ resourcePath }),
      ).not.toThrow();
    },
  );

  it.each([
    {
      title: '.. traversal',
      resourcePath: '../../../other-ws/file.js',
    },
    {
      title: 'absolute path',
      resourcePath: '/etc/passwd',
    },
    {
      title: 'null bytes',
      resourcePath: 'file\0.txt',
    },
    {
      title: 'backslashes',
      resourcePath: '..\\..\\etc\\passwd',
    },
    {
      title: 'empty string',
      resourcePath: '',
    },
  ])(
    'should reject unsafe path: $title',
    ({ resourcePath }) => {
      expect(() =>
        validateResourcePathOrThrow({ resourcePath }),
      ).toThrow(
        expect.objectContaining({
          code: FileStorageExceptionCode.ACCESS_DENIED,
        }),
      );
    },
  );
});
