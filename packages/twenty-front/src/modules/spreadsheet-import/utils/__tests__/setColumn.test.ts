import {
  Column,
  ColumnType,
} from '@/spreadsheet-import/steps/components/MatchColumnsStep/MatchColumnsStep';
import { Field } from '@/spreadsheet-import/types';
import { setColumn } from '@/spreadsheet-import/utils/setColumn';

describe('setColumn', () => {
  const defaultField: Field<'Name'> = {
    icon: null,
    label: 'label',
    key: 'Name',
    fieldType: { type: 'input' },
  };

  const oldColumn: Column<'oldValue'> = {
    index: 0,
    header: 'Name',
    type: ColumnType.matched,
    value: 'oldValue',
  };

  it('should return a matchedSelectOptions column if field type is "select"', () => {
    const field = {
      ...defaultField,
      fieldType: {
        type: 'select',
        options: [{ value: 'John' }, { value: 'Alice' }],
      },
    } as Field<'Name'>;

    const data = [['John'], ['Alice']];
    const result = setColumn(oldColumn, field, data);

    expect(result).toEqual({
      index: 0,
      header: 'Name',
      type: ColumnType.matchedSelectOptions,
      value: 'Name',
      matchedOptions: [
        {
          entry: 'John',
          value: 'John',
        },
        {
          entry: 'Alice',
          value: 'Alice',
        },
      ],
    });
  });

  it('should return a matchedCheckbox column if field type is "checkbox"', () => {
    const field = {
      ...defaultField,
      fieldType: { type: 'checkbox' },
    } as Field<'Name'>;

    const result = setColumn(oldColumn, field);

    expect(result).toEqual({
      index: 0,
      header: 'Name',
      type: ColumnType.matchedCheckbox,
      value: 'Name',
    });
  });

  it('should return a matched column if field type is "input"', () => {
    const field = {
      ...defaultField,
      fieldType: { type: 'input' },
    } as Field<'Name'>;

    const result = setColumn(oldColumn, field);

    expect(result).toEqual({
      index: 0,
      header: 'Name',
      type: ColumnType.matched,
      value: 'Name',
    });
  });

  it('should return an empty column if field type is not recognized', () => {
    const field = {
      ...defaultField,
      fieldType: { type: 'unknown' },
    } as unknown as Field<'Name'>;

    const result = setColumn(oldColumn, field);

    expect(result).toEqual({
      index: 0,
      header: 'Name',
      type: ColumnType.empty,
    });
  });
});
