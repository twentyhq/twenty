import { extractFileIdFromPath } from 'src/engine/core-modules/file/utils/extract-file-id-from-path.utils';

describe('extractFileIdFromPath', () => {
  it('should return the last segment of a normal path', () => {
    const result = extractFileIdFromPath('uploads/files/1234.txt');

    expect(result).toBe('1234.txt');
  });

  it('should return the last segment when there is no slash', () => {
    const result = extractFileIdFromPath('file.txt');

    expect(result).toBe('file.txt');
  });

  it('should return empty string for an empty path', () => {
    expect(() => extractFileIdFromPath('')).toThrow(
      new Error('Cannot extract id from empty path'),
    );
  });

  it('should handle trailing slashes correctly', () => {
    const folderPath = 'uploads/files/';

    expect(() => extractFileIdFromPath(folderPath)).toThrow(
      new Error(`Cannot extract id from folder path '${folderPath}'`),
    );
  });

  it('should return the last non-empty segment', () => {
    const folderPath = '/a/b/c/';

    expect(() => extractFileIdFromPath(folderPath)).toThrow(
      new Error(`Cannot extract id from folder path '${folderPath}'`),
    );
  });
});
