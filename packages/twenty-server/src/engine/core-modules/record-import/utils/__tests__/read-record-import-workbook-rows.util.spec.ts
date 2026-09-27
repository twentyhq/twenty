import * as XLSX from 'xlsx-ugnis';

import { type RecordImportRow } from 'src/engine/core-modules/record-import/types/record-import-session.type';
import { readRecordImportWorkbookRows } from 'src/engine/core-modules/record-import/utils/read-record-import-workbook-rows.util';

const buildWorkbook = () => {
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet([
      ['name', 'amount'],
      ['Acme', 12],
      [],
      ['Globex', 3.5],
    ]),
    'Companies',
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet([['other']]),
    'Other',
  );

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
};

describe('readRecordImportWorkbookRows', () => {
  it('reads a sheet in a worker thread with original row numbers', async () => {
    const rows: RecordImportRow[] = [];
    let sheetNames: string[] = [];

    for await (const row of readRecordImportWorkbookRows({
      buffer: buildWorkbook(),
      sheetName: 'Companies',
      onSheetNames: (names) => {
        sheetNames = names;
      },
    })) {
      rows.push(row);
    }

    expect(sheetNames).toEqual(['Companies', 'Other']);
    expect(rows).toEqual([
      { rowNumber: 1, cells: ['name', 'amount'] },
      { rowNumber: 2, cells: ['Acme', '12'] },
      { rowNumber: 4, cells: ['Globex', '3.5'] },
    ]);
  });

  it('fails cleanly on a file that is not a workbook', async () => {
    const read = async () => {
      for await (const _row of readRecordImportWorkbookRows({
        buffer: Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00]),
      })) {
        // drain
      }
    };

    await expect(read()).rejects.toThrow();
  });
});
