import { validateSafeRelativePath } from 'src/engine/core-modules/file-storage/utils/validate-safe-relative-path.util';

describe('validateSafeRelativePath', () => {
  it.each([
    { title: 'nested relative path', resourcePath: 'src/components/test.mjs' },
    { title: 'simple filename', resourcePath: 'file.mjs' },
    { title: 'deeply nested path', resourcePath: 'a/b/c/d.txt' },
  ])('should return isValid: true for $title', ({ resourcePath }) => {
    expect(validateSafeRelativePath({ resourcePath })).toEqual({
      isValid: true,
    });
  });

  it.each([
    {
      title: 'empty string',
      resourcePath: '',
      expectedError: 'must not be empty',
    },
    {
      title: 'null bytes',
      resourcePath: 'file\0.txt',
      expectedError: 'contains null bytes',
    },
    {
      title: 'absolute path',
      resourcePath: '/etc/passwd',
      expectedError: 'must be relative',
    },
    {
      title: 'backslashes',
      resourcePath: '..\\..\\etc\\passwd',
      expectedError: 'must not contain backslashes',
    },
    {
      title: '.. traversal',
      resourcePath: '../../../other-ws/file.js',
      expectedError: 'path traversal',
    },
  ])(
    'should return isValid: false for $title',
    ({ resourcePath, expectedError }) => {
      const result = validateSafeRelativePath({ resourcePath });

      expect(result.isValid).toBe(false);

      if (!result.isValid) {
        expect(result.error).toContain(expectedError);
      }
    },
  );
});
