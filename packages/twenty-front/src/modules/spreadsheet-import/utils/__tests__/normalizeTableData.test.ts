import { type SpreadsheetImportField } from '@/spreadsheet-import/types';
import { type SpreadsheetColumn } from '@/spreadsheet-import/types/SpreadsheetColumn';
import { type SpreadsheetColumns } from '@/spreadsheet-import/types/SpreadsheetColumns';
import { SpreadsheetColumnType } from '@/spreadsheet-import/types/SpreadsheetColumnType';
import { normalizeTableData } from '@/spreadsheet-import/utils/normalizeTableData';
import { FieldMetadataType } from 'twenty-shared/types';

describe('normalizeTableData', () => {
  const columns: SpreadsheetColumn[] = [
    {
      index: 0,
      header: 'Name',
      type: SpreadsheetColumnType.matched,
      value: 'name',
    },
    {
      index: 1,
      header: 'Age',
      type: SpreadsheetColumnType.matched,
      value: 'age',
    },
    {
      index: 2,
      header: 'Active',
      type: SpreadsheetColumnType.matchedCheckbox,
      value: 'active',
    },
  ];

  const fields = [
    {
      key: 'name',
      label: 'Name',
      fieldType: { type: 'input' },
      fieldMetadataType: FieldMetadataType.TEXT,
      Icon: null,
    },
    {
      key: 'age',
      label: 'Age',
      fieldType: { type: 'input' },
      fieldMetadataType: FieldMetadataType.NUMBER,
      Icon: null,
    },
    {
      key: 'active',
      label: 'Active',
      fieldType: {
        type: 'checkbox',
      },
      fieldMetadataType: FieldMetadataType.BOOLEAN,
      Icon: null,
    },
  ] as SpreadsheetImportField[];

  const rawData = [
    ['John', '30', 'Yes'],
    ['Alice', '', 'No'],
    ['Bob', '25', 'Maybe'],
  ];

  it('should normalize table data according to columns and fields', () => {
    const result = normalizeTableData(columns, rawData, fields);

    expect(result).toStrictEqual([
      { name: 'John', age: '30', active: true },
      { name: 'Alice', age: undefined, active: false },
      { name: 'Bob', age: '25', active: false },
    ]);
  });

  it('should normalize matchedCheckbox values and handle booleanMatches', () => {
    const columns: SpreadsheetColumn[] = [
      {
        index: 0,
        header: 'Active',
        type: SpreadsheetColumnType.matchedCheckbox,
        value: 'active',
      },
    ];

    const fields = [
      {
        key: 'active',
        label: 'Active',
        fieldType: {
          type: 'checkbox',
          booleanMatches: { yes: true, no: false },
        },
        fieldMetadataType: FieldMetadataType.BOOLEAN,
        Icon: null,
        fieldMetadataItemId: '1',
        isNestedField: false,
      },
    ] as SpreadsheetImportField[];

    const rawData = [['Yes'], ['No'], ['OtherValue']];

    const result = normalizeTableData(columns, rawData, fields);

    expect(result).toStrictEqual([{ active: true }, { active: false }, {}]);
  });

  it('should map matchedSelect and matchedSelectOptions values correctly', () => {
    const columns: SpreadsheetColumn[] = [
      {
        index: 0,
        header: 'Number',
        type: SpreadsheetColumnType.matchedSelect,
        value: 'number',
        matchedOptions: [
          { entry: 'One', value: '1' },
          { entry: 'Two', value: '2' },
        ],
      },
    ];

    const fields = [
      {
        key: 'number',
        label: 'Number',
        fieldType: {
          type: 'select',
          options: [
            { label: 'One', value: '1' },
            { label: 'Two', value: '2' },
          ],
        },
        fieldMetadataType: FieldMetadataType.SELECT,
        Icon: null,
      },
    ] as SpreadsheetImportField[];

    const rawData = [['One'], ['Two'], ['OtherValue']];

    const result = normalizeTableData(columns, rawData, fields);

    expect(result).toStrictEqual([
      { number: '1' },
      { number: '2' },
      { number: undefined },
    ]);
  });

  it('should handle empty and ignored columns', () => {
    const columns: SpreadsheetColumn[] = [
      { index: 0, header: 'Empty', type: SpreadsheetColumnType.empty },
      { index: 1, header: 'Ignored', type: SpreadsheetColumnType.ignored },
    ];

    const rawData = [['Value1', 'Value2']];

    const result = normalizeTableData(columns, rawData, []);

    expect(result).toStrictEqual([{}]);
  });

  it('should handle unrecognized column types and return empty object', () => {
    const columns: SpreadsheetColumns = [
      {
        index: 0,
        header: 'Unrecognized',
        type: 'Unknown' as unknown as SpreadsheetColumnType.matched,
        value: '',
      },
    ];

    const rawData = [['Value']];

    const result = normalizeTableData(columns, rawData, []);

    expect(result).toStrictEqual([{}]);
  });
});
