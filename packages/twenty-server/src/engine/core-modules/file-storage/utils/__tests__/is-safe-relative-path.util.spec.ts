import { isSafeRelativePath } from 'src/engine/core-modules/file-storage/utils/is-safe-relative-path.util';

describe('isSafeRelativePath', () => {
  it('should accept valid relative paths', () => {
    expect(isSafeRelativePath('src/components/my-component.mjs')).toBe(true);
    expect(isSafeRelativePath('file.mjs')).toBe(true);
    expect(isSafeRelativePath('a/b/c/d.txt')).toBe(true);
    expect(isSafeRelativePath('.hidden-file')).toBe(true);
    expect(isSafeRelativePath('folder/.gitignore')).toBe(true);
    expect(isSafeRelativePath('file.name.ext')).toBe(true);
  });

  it('should reject paths with .. traversal segments', () => {
    expect(isSafeRelativePath('../etc/passwd')).toBe(false);
    expect(isSafeRelativePath('folder/../../etc/passwd')).toBe(false);
    expect(isSafeRelativePath('..')).toBe(false);
    expect(
      isSafeRelativePath(
        '../../../other-ws/other-app/BuiltFrontComponent/file.js',
      ),
    ).toBe(false);
  });

  it('should reject paths with null bytes', () => {
    expect(isSafeRelativePath('file\0.txt')).toBe(false);
    expect(isSafeRelativePath('folder/\0/file.txt')).toBe(false);
  });

  it('should reject absolute paths', () => {
    expect(isSafeRelativePath('/etc/passwd')).toBe(false);
    expect(isSafeRelativePath('/tmp/file.txt')).toBe(false);
  });

  it('should reject paths with backslashes', () => {
    expect(isSafeRelativePath('folder\\file.txt')).toBe(false);
    expect(isSafeRelativePath('..\\..\\etc\\passwd')).toBe(false);
  });

  it('should reject empty strings', () => {
    expect(isSafeRelativePath('')).toBe(false);
  });
});
