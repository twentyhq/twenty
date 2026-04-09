import { getFileNameAndExtension } from '~/utils/file/getFileNameAndExtension';

describe('getFileNameAndExtension', () => {
  it('should split filename with extension correctly', () => {
    const result = getFileNameAndExtension('document.pdf');
    expect(result).toEqual({
      name: 'document',
      extension: '.pdf',
    });
  });

  it('should handle files with multiple dots', () => {
    const result = getFileNameAndExtension('my.file.name.txt');
    expect(result).toEqual({
      name: 'my.file.name',
      extension: '.txt',
    });
  });

  it('should handle files with no extension', () => {
    const result = getFileNameAndExtension('README');
    expect(result).toEqual({
      name: '',
      extension: 'README',
    });
  });

  it('should handle files starting with dot', () => {
    const result = getFileNameAndExtension('.gitignore');
    expect(result).toEqual({
      name: '',
      extension: '.gitignore',
    });
  });

  it('should handle hidden files with extension', () => {
    const result = getFileNameAndExtension('.env.local');
    expect(result).toEqual({
      name: '.env',
      extension: '.local',
    });
  });

  it('should handle empty string', () => {
    const result = getFileNameAndExtension('');
    expect(result).toEqual({
      name: '',
      extension: '',
    });
  });

  it('should handle files with long extensions', () => {
    const result = getFileNameAndExtension('archive.tar.gz');
    expect(result).toEqual({
      name: 'archive.tar',
      extension: '.gz',
    });
  });

  it('should handle files with special characters', () => {
    const result = getFileNameAndExtension('file-name_with@special#chars.xlsx');
    expect(result).toEqual({
      name: 'file-name_with@special#chars',
      extension: '.xlsx',
    });
  });

  it('should handle files with spaces', () => {
    const result = getFileNameAndExtension('my document file.docx');
    expect(result).toEqual({
      name: 'my document file',
      extension: '.docx',
    });
  });

  it('should handle files with path separators in name', () => {
    const result = getFileNameAndExtension('folder/subfolder/file.txt');
    expect(result).toEqual({
      name: 'folder/subfolder/file',
      extension: '.txt',
    });
  });

  it('should handle files with only extension', () => {
    const result = getFileNameAndExtension('.txt');
    expect(result).toEqual({
      name: '',
      extension: '.txt',
    });
  });

  it('should handle files with multiple consecutive dots', () => {
    const result = getFileNameAndExtension('file...txt');
    expect(result).toEqual({
      name: 'file..',
      extension: '.txt',
    });
  });

  it('should handle very long filenames', () => {
    const longName = 'a'.repeat(100);
    const result = getFileNameAndExtension(`${longName}.pdf`);
    expect(result).toEqual({
      name: longName,
      extension: '.pdf',
    });
  });

  it('should handle files with numbers', () => {
    const result = getFileNameAndExtension('report-2023-12-01.csv');
    expect(result).toEqual({
      name: 'report-2023-12-01',
      extension: '.csv',
    });
  });

  it('should handle uppercase extensions', () => {
    const result = getFileNameAndExtension('DOCUMENT.PDF');
    expect(result).toEqual({
      name: 'DOCUMENT',
      extension: '.PDF',
    });
  });
});
