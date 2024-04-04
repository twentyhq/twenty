import {
  Column,
  ColumnType,
} from '@/spreadsheet-import/steps/components/MatchColumnsStep/MatchColumnsStep';
import { Field } from '@/spreadsheet-import/types';
import { normalizeTableData } from '@/spreadsheet-import/utils/normalizeTableData';

describe('normalizeTableData', () => {
  const columns: Column<string>[] = [
    { index: 0, header: 'Name', type: ColumnType.matched, value: 'name' },
    { index: 1, header: 'Age', type: ColumnType.matched, value: 'age' },
    {
      index: 2,
      header: 'Active',
      type: ColumnType.matchedCheckbox,
      value: 'active',
    },
  ];

  const fields: Field<string>[] = [
    { key: 'name', label: 'Name', fieldType: { type: 'input' }, icon: null },
    { key: 'age', label: 'Age', fieldType: { type: 'input' }, icon: null },
    {
      key: 'active',
      label: 'Active',
      fieldType: {
        type: 'checkbox',
      },
      icon: null,
    },
  ];

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
    const columns: Column<string>[] = [
      {
        index: 0,
        header: 'Active',
        type: ColumnType.matchedCheckbox,
        value: 'active',
      },
    ];

    const fields: Field<string>[] = [
      {
        key: 'active',
        label: 'Active',
        fieldType: {
          type: 'checkbox',
          booleanMatches: { yes: true, no: false },
        },
        icon: null,
      },
    ];

    const rawData = [['Yes'], ['No'], ['OtherValue']];

    const result = normalizeTableData(columns, rawData, fields);

    expect(result).toStrictEqual([{ active: true }, { active: false }, {}]);
  });

  it('should map matchedSelect and matchedSelectOptions values correctly', () => {
    const columns: Column<string>[] = [
      {
        index: 0,
        header: 'Number',
        type: ColumnType.matchedSelect,
        value: 'number',
        matchedOptions: [
          { entry: 'One', value: '1' },
          { entry: 'Two', value: '2' },
        ],
      },
    ];

    const fields: Field<string>[] = [
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
        icon: null,
      },
    ];

    const rawData = [['One'], ['Two'], ['OtherValue']];

    const result = normalizeTableData(columns, rawData, fields);

    expect(result).toStrictEqual([
      { number: '1' },
      { number: '2' },
      { number: undefined },
    ]);
  });

  it('should handle empty and ignored columns', () => {
    const columns: Column<string>[] = [
      { index: 0, header: 'Empty', type: ColumnType.empty },
      { index: 1, header: 'Ignored', type: ColumnType.ignored },
    ];

    const rawData = [['Value1', 'Value2']];

    const result = normalizeTableData(columns, rawData, []);

    expect(result).toStrictEqual([{}]);
  });

  it('should handle unrecognized column types and return empty object', () => {
    const columns: Column<string>[] = [
      {
        index: 0,
        header: 'Unrecognized',
        type: 'Unknown' as unknown as ColumnType.matched,
        value: '',
      },
    ];

    const rawData = [['Value']];

    const result = normalizeTableData(columns, rawData, []);

    expect(result).toStrictEqual([{}]);
  });
});
