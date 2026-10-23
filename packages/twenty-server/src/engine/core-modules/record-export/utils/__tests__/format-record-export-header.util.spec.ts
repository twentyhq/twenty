import { formatRecordExportHeader } from 'src/engine/core-modules/record-export/utils/format-record-export-header.util';

describe('formatRecordExportHeader', () => {
  it('writes a BOM-prefixed header of column labels', () => {
    expect(
      formatRecordExportHeader([{ label: 'Id' }, { label: 'Address / City' }]),
    ).toBe('﻿Id,Address / City\n');
  });

  it('quotes labels with separators and neutralises formula-like labels', () => {
    expect(
      formatRecordExportHeader([{ label: 'Name, short' }, { label: '=Total' }]),
    ).toBe('﻿"Name, short",‍=Total\n');
  });
});
