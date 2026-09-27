import { detectRecordImportFileType } from 'src/engine/core-modules/record-import/utils/detect-record-import-file-type.util';
import { detectRecordImportTextEncoding } from 'src/engine/core-modules/record-import/utils/detect-record-import-text-encoding.util';

describe('detectRecordImportFileType', () => {
  it('detects workbooks from their signature whatever the file is called', () => {
    expect(
      detectRecordImportFileType(Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14])),
    ).toBe('xlsx');
    expect(
      detectRecordImportFileType(
        Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0x00]),
      ),
    ).toBe('xls');
  });

  it('treats text as CSV and rejects other binary content', () => {
    expect(detectRecordImportFileType(Buffer.from('name,email\n'))).toBe('csv');
    expect(
      detectRecordImportFileType(Buffer.from([0xff, 0xfe, 0x6e, 0x00])),
    ).toBe('csv');
    expect(
      detectRecordImportFileType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00])),
    ).toBeUndefined();
  });
});

describe('detectRecordImportTextEncoding', () => {
  it('keeps UTF-8, including a multi-byte character cut at the end', () => {
    const text = Buffer.from('name\nJosé', 'utf8');

    expect(detectRecordImportTextEncoding(text)).toBe('utf-8');
    expect(detectRecordImportTextEncoding(text.subarray(0, -1))).toBe('utf-8');
  });

  it('falls back to Windows-1252 for bytes that are not UTF-8', () => {
    expect(
      detectRecordImportTextEncoding(
        Buffer.from([0x4a, 0x6f, 0x73, 0xe9, 0x0a]),
      ),
    ).toBe('windows-1252');
  });

  it('reads UTF-16 byte order marks', () => {
    expect(
      detectRecordImportTextEncoding(Buffer.from([0xff, 0xfe, 0x41])),
    ).toBe('utf-16le');
  });
});
