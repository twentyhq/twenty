import { type SpreadsheetImportField } from '@/spreadsheet-import/types';
import { type SpreadsheetColumns } from '@/spreadsheet-import/types/SpreadsheetColumns';
import { SpreadsheetColumnType } from '@/spreadsheet-import/types/SpreadsheetColumnType';
import { getMatchedColumnsWithFuse } from '@/spreadsheet-import/utils/getMatchedColumnsWithFuse';
import { FieldMetadataType } from 'twenty-shared/types';

const buildField = (
  overrides: Partial<SpreadsheetImportField>,
): SpreadsheetImportField => ({
  Icon: null,
  label: 'label',
  key: 'key',
  fieldMetadataItemId: 'field-metadata-item-id',
  fieldType: { type: 'input' },
  fieldMetadataType: FieldMetadataType.TEXT,
  isNestedField: false,
  ...overrides,
});

const COLUMNS: SpreadsheetColumns = [
  {
    type: SpreadsheetColumnType.empty,
    index: 0,
    header: 'Full Name / First Name',
  },
];

describe('getMatchedColumnsWithFuse', () => {
  it('should match an English column header through an alternate match', () => {
    const { matchedColumns } = getMatchedColumnsWithFuse({
      columns: COLUMNS,
      fields: [
        buildField({
          label: 'Nom complet / Prénom',
          alternateMatches: ['Full Name / First Name'],
          key: 'First Name (fullName)',
        }),
      ],
      data: [],
    });

    expect(matchedColumns[0]).toMatchObject({
      type: SpreadsheetColumnType.matched,
      value: 'First Name (fullName)',
    });
  });

  it('should leave the column unmatched without the alternate match', () => {
    const { matchedColumns } = getMatchedColumnsWithFuse({
      columns: COLUMNS,
      fields: [
        buildField({
          label: 'Nom complet / Prénom',
          key: 'First Name (fullName)',
        }),
      ],
      data: [],
    });

    expect(matchedColumns[0]).toMatchObject({
      type: SpreadsheetColumnType.empty,
    });
  });
});
