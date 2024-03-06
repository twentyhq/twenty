import {
  Column,
  ColumnType,
} from '@/spreadsheet-import/steps/components/MatchColumnsStep/MatchColumnsStep';
import { Field } from '@/spreadsheet-import/types';
import { getMatchedColumns } from '@/spreadsheet-import/utils/getMatchedColumns';

describe('getMatchedColumns', () => {
  const columns: Column<string>[] = [
    { index: 0, header: 'Name', type: ColumnType.matched, value: 'Name' },
    {
      index: 1,
      header: 'Location',
      type: ColumnType.matched,
      value: 'Location',
    },
    {
      index: 2,
      header: 'Age',
      type: ColumnType.matched,
      value: 'Age',
    },
  ];

  const fields: Field<string>[] = [
    {
      key: 'Name',
      label: 'Name',
      fieldType: { type: 'input' },
      icon: null,
    },
    {
      key: 'Location',
      label: 'Location',
      fieldType: { type: 'select', options: [] },
      icon: null,
    },
    { key: 'Age', label: 'Age', fieldType: { type: 'input' }, icon: null },
  ];

  const data = [
    ['John', 'New York'],
    ['Alice', 'Los Angeles'],
  ];

  const autoMapDistance = 2;

  it('should return matched columns for each field', () => {
    const result = getMatchedColumns(columns, fields, data, autoMapDistance);
    expect(result).toEqual([
      { index: 0, header: 'Name', type: ColumnType.matched, value: 'Name' },
      {
        index: 1,
        header: 'Location',
        type: ColumnType.matchedSelect,
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
      { index: 2, header: 'Age', type: ColumnType.matched, value: 'Age' },
    ]);
  });

  it('should handle columns with duplicate values by choosing the closest match', () => {
    const columnsWithDuplicates: Column<string>[] = [
      { index: 0, header: 'Name', type: ColumnType.matched, value: 'Name' },
      { index: 1, header: 'Name', type: ColumnType.matched, value: 'Name' },
      {
        index: 2,
        header: 'Location',
        type: ColumnType.matched,
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
      type: ColumnType.empty,
    });
    expect(result[1]).toEqual({
      index: 1,
      header: 'Name',
      type: ColumnType.matched,
      value: 'Name',
    });
  });

  it('should return initial columns when no auto match is found', () => {
    const unmatchedColumnsData: string[][] = [
      ['John', 'New York', '30'],
      ['Alice', 'Los Angeles', '25'],
    ];

    const unmatchedFields: Field<string>[] = [
      {
        key: 'Hobby',
        label: 'Hobby',
        fieldType: { type: 'input' },
        icon: null,
      },
      {
        key: 'Interest',
        label: 'Interest',
        fieldType: { type: 'input' },
        icon: null,
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
