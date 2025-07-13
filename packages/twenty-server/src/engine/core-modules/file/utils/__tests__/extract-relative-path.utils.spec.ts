import { extractRelativePath } from 'src/engine/core-modules/file/utils/extract-relative-path.utils';

describe('extractRelativePath', () => {
  it('should extract relative path from URL with token', () => {
    const result = extractRelativePath(
      '/files/attachment/token123/filename.jpg',
    );

    expect(result).toBe('attachment/filename.jpg');
  });

  it('should extract relative path from general file URL', () => {
    const result = extractRelativePath('/files/path/to/file.pdf');

    expect(result).toBe('path/to/file.pdf');
  });

  it('should extract relative path from attachment path', () => {
    const result = extractRelativePath('attachment/document.docx');

    expect(result).toBe('attachment/document.docx');
  });

  it('should return full path when no patterns match', () => {
    const result = extractRelativePath('some/other/path/file.txt');

    expect(result).toBe('some/other/path/file.txt');
  });
});
