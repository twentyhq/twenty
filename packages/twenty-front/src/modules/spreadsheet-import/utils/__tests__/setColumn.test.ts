import { type SpreadsheetImportField } from '@/spreadsheet-import/types';
import { type SpreadsheetColumn } from '@/spreadsheet-import/types/SpreadsheetColumn';
import { SpreadsheetColumnType } from '@/spreadsheet-import/types/SpreadsheetColumnType';
import { setColumn } from '@/spreadsheet-import/utils/setColumn';
import { FieldMetadataType } from 'twenty-shared/types';

describe('setColumn', () => {
  const defaultField = {
    Icon: null,
    label: 'label',
    key: 'Name',
    fieldType: { type: 'input' },
    fieldMetadataType: FieldMetadataType.TEXT,
  } as SpreadsheetImportField;

  const oldColumn: SpreadsheetColumn = {
    index: 0,
    header: 'Name',
    type: SpreadsheetColumnType.matched,
    value: 'oldValue',
  };

  it('should return a matchedSelectOptions column if field type is "select"', () => {
    const field = {
      ...defaultField,
      fieldType: {
        type: 'select',
        options: [{ value: 'John' }, { value: 'Alice' }],
      },
    } as SpreadsheetImportField;

    const data = [['John'], ['Alice']];
    const result = setColumn(oldColumn, field, data);

    expect(result).toEqual({
      index: 0,
      header: 'Name',
      type: SpreadsheetColumnType.matchedSelectOptions,
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
    } as SpreadsheetImportField;

    const result = setColumn(oldColumn, field);

    expect(result).toEqual({
      index: 0,
      header: 'Name',
      type: SpreadsheetColumnType.matchedCheckbox,
      value: 'Name',
    });
  });

  it('should return a matched column if field type is "input"', () => {
    const field = {
      ...defaultField,
      fieldType: { type: 'input' },
    } as SpreadsheetImportField;

    const result = setColumn(oldColumn, field);

    expect(result).toEqual({
      index: 0,
      header: 'Name',
      type: SpreadsheetColumnType.matched,
      value: 'Name',
    });
  });

  it('should return an empty column if field type is not recognized', () => {
    const field = {
      ...defaultField,
      fieldType: { type: 'unknown' },
    } as unknown as SpreadsheetImportField;

    const result = setColumn(oldColumn, field);

    expect(result).toEqual({
      index: 0,
      header: 'Name',
      type: SpreadsheetColumnType.empty,
    });
  });
});
