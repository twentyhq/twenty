import { FieldMetadataType } from 'twenty-shared/types';

import { type RecordExportColumn } from 'src/engine/core-modules/record-export/types/record-export-column.type';
import { formatRecordExportRow } from 'src/engine/core-modules/record-export/utils/format-record-export-row.util';

describe('formatRecordExportRow', () => {
  const column = (
    fieldName: string,
    type = FieldMetadataType.TEXT,
    subFieldName?: string,
  ): RecordExportColumn => ({
    fieldName,
    label: fieldName,
    type,
    subFieldName,
  });

  it('escapes multiline text, quotes, arrays and JSON, while preserving empty cells', () => {
    expect(
      formatRecordExportRow({
        columns: [
          column('name'),
          column('tags'),
          column('json'),
          column('empty'),
        ],
        record: {
          name: 'Ada, "Lovelace"\nLondon',
          tags: ['A', 'B'],
          json: { key: 'value' },
          empty: null,
        },
      }),
    ).toBe(
      '"Ada, ""Lovelace""\nLondon","[""A"",""B""]","{""key"":""value""}",\n',
    );
  });

  it('protects formula strings including composite values without converting negative numbers to text', () => {
    expect(
      formatRecordExportRow({
        columns: [
          column('text'),
          column('name', FieldMetadataType.FULL_NAME, 'firstName'),
          column('number', FieldMetadataType.NUMBER),
        ],
        record: {
          text: '=SUM(1)',
          name: { firstName: '+cmd' },
          number: -12,
        },
      }),
    ).toBe('\u200D=SUM(1),\u200D+cmd,-12\n');
  });

  it('exports currency amounts and null composites consistently across batches', () => {
    const columns = [
      column('amount', FieldMetadataType.CURRENCY, 'amountMicros'),
      column('amount', FieldMetadataType.CURRENCY, 'currencyCode'),
    ];
    expect(formatRecordExportRow({ columns, record: { amount: null } })).toBe(
      ',\n',
    );
    expect(
      formatRecordExportRow({
        columns,
        record: {
          amount: { amountMicros: '-1234567', currencyCode: 'EUR' },
        },
      }),
    ).toBe('-1.234567,EUR\n');
  });
  it('serializes native database dates without introducing JSON quotes into CSV cells', () => {
    expect(
      formatRecordExportRow({
        columns: [
          column('createdAt', FieldMetadataType.DATE_TIME),
          column('birthday', FieldMetadataType.DATE),
          column('dateString', FieldMetadataType.DATE),
        ],
        record: {
          createdAt: new Date('2026-01-02T03:04:05.000Z'),
          birthday: new Date('2000-01-02T00:00:00.000Z'),
          dateString: '2000-01-02',
        },
      }),
    ).toBe('2026-01-02T03:04:05.000Z,2000-01-02,2000-01-02\n');
  });
});
