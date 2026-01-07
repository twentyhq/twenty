import { getFileType } from '@/activities/files/utils/getFileType';

describe('getFileType', () => {
  it('should return the correct file category for a given file name', () => {
    expect(getFileType('test.doc')).toBe('TEXT_DOCUMENT');
    expect(getFileType('test.xls')).toBe('SPREADSHEET');
    expect(getFileType('test.ppt')).toBe('PRESENTATION');
    expect(getFileType('test.png')).toBe('IMAGE');
    expect(getFileType('test.mp4')).toBe('VIDEO');
    expect(getFileType('test.mp3')).toBe('AUDIO');
    expect(getFileType('test.zip')).toBe('ARCHIVE');
  });
});
