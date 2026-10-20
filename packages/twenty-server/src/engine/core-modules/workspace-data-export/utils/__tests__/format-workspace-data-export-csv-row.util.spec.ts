import { formatWorkspaceDataExportCsvHeader } from 'src/engine/core-modules/workspace-data-export/utils/format-workspace-data-export-csv-header.util';
import { formatWorkspaceDataExportCsvRow } from 'src/engine/core-modules/workspace-data-export/utils/format-workspace-data-export-csv-row.util';

const columns = [
  { name: 'id', isText: false },
  { name: 'name', isText: true },
  { name: 'amountMicros', isText: false },
  { name: 'createdAt', isText: false },
  { name: 'emails', isText: false },
  { name: 'isActive', isText: false },
];

describe('formatWorkspaceDataExportCsvRow', () => {
  it('writes a BOM-prefixed header with the column names', () => {
    expect(formatWorkspaceDataExportCsvHeader(columns)).toBe(
      '﻿id,name,amountMicros,createdAt,emails,isActive\n',
    );
  });

  it('formats dates, json, booleans and nulls', () => {
    expect(
      formatWorkspaceDataExportCsvRow({
        columns,
        row: {
          id: 'abc',
          name: null,
          amountMicros: '1500000',
          createdAt: new Date('2026-10-20T10:00:00.000Z'),
          emails: { primaryEmail: 'a@b.c', additionalEmails: ['d@e.f'] },
          isActive: true,
        },
      }),
    ).toBe(
      'abc,,1500000,2026-10-20T10:00:00.000Z,"{""primaryEmail"":""a@b.c"",""additionalEmails"":[""d@e.f""]}",true\n',
    );
  });

  it('quotes text with separators and neutralises formulas in text columns only', () => {
    expect(
      formatWorkspaceDataExportCsvRow({
        columns,
        row: {
          id: 'abc',
          name: '=SUM(A1), "quoted"',
          amountMicros: '-42',
          createdAt: null,
          emails: null,
          isActive: false,
        },
      }),
    ).toBe('abc,"‍=SUM(A1), ""quoted""",-42,,,false\n');
  });
});
