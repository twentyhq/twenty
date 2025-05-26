import { extractFilenameFromPath } from 'src/engine/core-modules/file/utils/extract-file-id-from-path.utils';

describe('extractFileIdFromPath', () => {
  it('should return the last segment of a normal path', () => {
    const result = extractFilenameFromPath('uploads/files/1234.txt');

    expect(result).toBe('1234.txt');
  });

  it('should return the last segment when there is no slash', () => {
    const result = extractFilenameFromPath('file.txt');

    expect(result).toBe('file.txt');
  });

  it('should throw when empty path', () => {
    expect(() => extractFilenameFromPath('')).toThrow(
      new Error('Cannot extract id from empty path'),
    );
  });

  it('should throw when empty filename', () => {
    const folderPath = 'uploads/files/';

    expect(() => extractFilenameFromPath(folderPath)).toThrow(
      new Error(`Cannot extract id from folder path '${folderPath}'`),
    );
  });

  it('should throw when empty filename absolute path', () => {
    const folderPath = '/a/b/c/';

    expect(() => extractFilenameFromPath(folderPath)).toThrow(
      new Error(`Cannot extract id from folder path '${folderPath}'`),
    );
  });
});
