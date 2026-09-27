import { Readable } from 'stream';

import { RecordImportException } from 'src/engine/core-modules/record-import/record-import.exception';
import { type RecordImportRow } from 'src/engine/core-modules/record-import/types/record-import-session.type';
import {
  guessRecordImportCsvDelimiter,
  readRecordImportCsvRows,
} from 'src/engine/core-modules/record-import/utils/read-record-import-csv-rows.util';

const readAll = async (content: Buffer | string, encoding = 'utf-8') => {
  const rows: RecordImportRow[] = [];

  for await (const row of readRecordImportCsvRows({
    // Small chunks exercise records and characters split across reads
    stream: Readable.from(
      Buffer.from(content)
        .toString('latin1')
        .match(/[\s\S]{1,7}/g)!
        .map((part) => Buffer.from(part, 'latin1')),
    ),
    encoding,
    delimiter: guessRecordImportCsvDelimiter(
      new TextDecoder(encoding).decode(Buffer.from(content)),
    ),
  })) {
    rows.push(row);
  }

  return rows;
};

describe('readRecordImportCsvRows', () => {
  it('numbers records, skips blank ones and keeps quoted line breaks', async () => {
    const rows = await readAll(
      '﻿name,notes\n"Acme","line one\nline two"\n\n,\nGlobex,"say ""hi"""\n',
    );

    expect(rows).toEqual([
      { rowNumber: 1, cells: ['name', 'notes'] },
      { rowNumber: 2, cells: ['Acme', 'line one\nline two'] },
      { rowNumber: 5, cells: ['Globex', 'say "hi"'] },
    ]);
  });

  it.each([
    ['a;b\n1;2\n', ';'],
    ['Name;Id\nSociete G;abc\n', ';'],
    ['a\tb\n1\t2\n', '\t'],
    ['a|b|c\n1|2|3', '|'],
    ['x,y\n1,2\n\n', ','],
    ['name,notes\n1,"a;b"\n', ','],
  ])('guesses the delimiter of %j', (sample, expectedDelimiter) => {
    expect(guessRecordImportCsvDelimiter(sample)).toBe(expectedDelimiter);
  });

  it('decodes Windows-1252 files', async () => {
    const rows = await readAll(
      Buffer.from([0x6e, 0x0a, 0x4a, 0x6f, 0x73, 0xe9, 0x0a]),
      'windows-1252',
    );

    expect(rows[1].cells).toEqual(['José']);
  });

  it('rejects rows beyond the column limit', async () => {
    await expect(readAll(`${'x,'.repeat(600)}x\n`)).rejects.toBeInstanceOf(
      RecordImportException,
    );
  });
});
