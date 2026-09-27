import { type RecordImportFileType } from 'src/engine/core-modules/record-import/types/record-import-session.type';

const ZIP_SIGNATURE = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
const COMPOUND_FILE_SIGNATURE = Buffer.from([
  0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1,
]);
const UTF_16_BOMS = [Buffer.from([0xff, 0xfe]), Buffer.from([0xfe, 0xff])];

// Decided from the bytes only: a declared extension or MIME type is a client
// claim (SEC-2).
export const detectRecordImportFileType = (
  prefix: Buffer,
): RecordImportFileType | undefined => {
  if (prefix.subarray(0, ZIP_SIGNATURE.length).equals(ZIP_SIGNATURE)) {
    return 'xlsx';
  }

  if (
    prefix
      .subarray(0, COMPOUND_FILE_SIGNATURE.length)
      .equals(COMPOUND_FILE_SIGNATURE)
  ) {
    return 'xls';
  }

  if (UTF_16_BOMS.some((bom) => prefix.subarray(0, 2).equals(bom))) {
    return 'csv';
  }

  return prefix.includes(0x00) ? undefined : 'csv';
};
