import { validatePathSegmentsIntegrity } from 'src/engine/core-modules/file-storage/utils/validate-path-segments-integrity.util';

describe('validatePathSegmentsIntegrity', () => {
  it.each([
    { title: 'simple filename', resourcePath: 'index.mjs' },
    { title: 'nested path', resourcePath: 'src/handlers/index.mjs' },
    { title: 'deeply nested path', resourcePath: 'a/b/c/d/file.ts' },
    { title: 'dashes and underscores', resourcePath: 'my-app/my_file.tsx' },
    { title: 'dots in directory name', resourcePath: 'v1.0/bundle.mjs' },
    { title: 'multiple dots in filename', resourcePath: 'module.config.mjs' },
    { title: 'numeric segments', resourcePath: '123/456.json' },
  ])('should return isValid: true for $title', ({ resourcePath }) => {
    expect(validatePathSegmentsIntegrity({ resourcePath })).toEqual({
      isValid: true,
    });
  });

  it.each([
    { title: 'filename without extension', resourcePath: 'Makefile' },
    {
      title: 'nested filename without extension',
      resourcePath: 'src/handlers/README',
    },
    { title: 'space in segment', resourcePath: 'my folder/file.mjs' },
    {
      title: 'special characters in filename',
      resourcePath: 'file@name.mjs',
    },
    { title: 'unicode in segment', resourcePath: 'données/file.mjs' },
    { title: 'parentheses in filename', resourcePath: 'file(1).mjs' },
    { title: 'hash in filename', resourcePath: 'file#2.mjs' },
    {
      title: 'segment exceeding 255 characters',
      resourcePath: `${'a'.repeat(256)}.mjs`,
    },
    {
      title: 'total path exceeding 1024 characters',
      resourcePath: `${'a/'.repeat(512)}file.mjs`,
    },
  ])('should return isValid: false for $title', ({ resourcePath }) => {
    const result = validatePathSegmentsIntegrity({ resourcePath });

    expect(result.isValid).toBe(false);

    if (!result.isValid) {
      expect(result.error).toBeDefined();
    }
  });
});
