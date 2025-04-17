import { SpreadsheetImportField } from '@/spreadsheet-import/types';
import { SpreadsheetColumn } from '@/spreadsheet-import/types/SpreadsheetColumn';
import { SpreadsheetColumnType } from '@/spreadsheet-import/types/SpreadsheetColumnType';
import { getMatchedColumns } from '@/spreadsheet-import/utils/getMatchedColumns';
import { FieldMetadataType } from 'twenty-shared/types';

describe('getMatchedColumns', () => {
  const columns: SpreadsheetColumn<string>[] = [
    {
      index: 0,
      header: 'Name',
      type: SpreadsheetColumnType.matched,
      value: 'Name',
    },
    {
      index: 1,
      header: 'Location',
      type: SpreadsheetColumnType.matched,
      value: 'Location',
    },
    {
      index: 2,
      header: 'Age',
      type: SpreadsheetColumnType.matched,
      value: 'Age',
    },
  ];

  const fields: SpreadsheetImportField<string>[] = [
    {
      key: 'Name',
      label: 'Name',
      fieldType: { type: 'input' },
      fieldMetadataType: FieldMetadataType.TEXT,
      Icon: null,
    },
    {
      key: 'Location',
      label: 'Location',
      fieldType: { type: 'select', options: [] },
      fieldMetadataType: FieldMetadataType.POSITION,
      Icon: null,
    },
    {
      key: 'Age',
      label: 'Age',
      fieldType: { type: 'input' },
      fieldMetadataType: FieldMetadataType.NUMBER,
      Icon: null,
    },
  ];

  const data = [
    ['John', 'New York'],
    ['Alice', 'Los Angeles'],
  ];

  const autoMapDistance = 2;

  it('should return matched columns for each field', () => {
    const result = getMatchedColumns(columns, fields, data, autoMapDistance);
    expect(result).toEqual([
      {
        index: 0,
        header: 'Name',
        type: SpreadsheetColumnType.matched,
        value: 'Name',
      },
      {
        index: 1,
        header: 'Location',
        type: SpreadsheetColumnType.matchedSelect,
        value: 'Location',
        matchedOptions: [
          {
            entry: 'New York',
          },
          {
            entry: 'Los Angeles',
          },
        ],
      },
      {
        index: 2,
        header: 'Age',
        type: SpreadsheetColumnType.matched,
        value: 'Age',
      },
    ]);
  });

  it('should handle columns with duplicate values by choosing the closest match', () => {
    const columnsWithDuplicates: SpreadsheetColumn<string>[] = [
      {
        index: 0,
        header: 'Name',
        type: SpreadsheetColumnType.matched,
        value: 'Name',
      },
      {
        index: 1,
        header: 'Name',
        type: SpreadsheetColumnType.matched,
        value: 'Name',
      },
      {
        index: 2,
        header: 'Location',
        type: SpreadsheetColumnType.matched,
        value: 'Location',
      },
    ];

    const result = getMatchedColumns(
      columnsWithDuplicates,
      fields,
      data,
      autoMapDistance,
    );

    expect(result[0]).toEqual({
      index: 0,
      header: 'Name',
      type: SpreadsheetColumnType.empty,
    });
    expect(result[1]).toEqual({
      index: 1,
      header: 'Name',
      type: SpreadsheetColumnType.matched,
      value: 'Name',
    });
  });

  it('should return initial columns when no auto match is found', () => {
    const unmatchedColumnsData: string[][] = [
      ['John', 'New York', '30'],
      ['Alice', 'Los Angeles', '25'],
    ];

    const unmatchedFields: SpreadsheetImportField<string>[] = [
      {
        key: 'Hobby',
        label: 'Hobby',
        fieldType: { type: 'input' },
        fieldMetadataType: FieldMetadataType.TEXT,
        Icon: null,
      },
      {
        key: 'Interest',
        label: 'Interest',
        fieldType: { type: 'input' },
        fieldMetadataType: FieldMetadataType.TEXT,
        Icon: null,
      },
    ];

    const result = getMatchedColumns(
      columns,
      unmatchedFields,
      unmatchedColumnsData,
      autoMapDistance,
    );

    expect(result).toEqual(columns);
  });
});
