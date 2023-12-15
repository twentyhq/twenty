import { getFileType } from '../getFileType';

describe('getFileType', () => {
  it('should return the correct file type for a given file name', () => {
    expect(getFileType('test.doc')).toBe('TextDocument');
    expect(getFileType('test.xls')).toBe('Spreadsheet');
    expect(getFileType('test.ppt')).toBe('Presentation');
    expect(getFileType('test.png')).toBe('Image');
    expect(getFileType('test.mp4')).toBe('Video');
    expect(getFileType('test.mp3')).toBe('Audio');
    expect(getFileType('test.zip')).toBe('Archive');
  });
});
