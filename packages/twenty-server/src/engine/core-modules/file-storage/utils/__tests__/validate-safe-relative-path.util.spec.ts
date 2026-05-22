import { validateSafeRelativePath } from 'src/engine/core-modules/file-storage/utils/validate-safe-relative-path.util';

describe('validateSafeRelativePath', () => {
  it.each([
    { title: 'nested relative path', resourcePath: 'src/components/test.mjs' },
    { title: 'simple filename', resourcePath: 'file.mjs' },
    { title: 'deeply nested path', resourcePath: 'a/b/c/d.txt' },
  ])(
    'should return isValid: true for $title',
    ({ resourcePath }) => {
      expect(validateSafeRelativePath({ resourcePath })).toEqual({
        isValid: true,
      });
    },
  );

  it.each([
    { title: '.. traversal', resourcePath: '../../../other-ws/file.js' },
    { title: 'absolute path', resourcePath: '/etc/passwd' },
    { title: 'null bytes', resourcePath: 'file\0.txt' },
    { title: 'backslashes', resourcePath: '..\\..\\etc\\passwd' },
    { title: 'empty string', resourcePath: '' },
  ])(
    'should return isValid: false for $title',
    ({ resourcePath }) => {
      const result = validateSafeRelativePath({ resourcePath });

      expect(result.isValid).toBe(false);

      if (!result.isValid) {
        expect(result.error).toBeDefined();
      }
    },
  );
});
