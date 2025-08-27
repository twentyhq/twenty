import { type SpreadsheetColumn } from '@/spreadsheet-import/types/SpreadsheetColumn';
import { SpreadsheetColumnType } from '@/spreadsheet-import/types/SpreadsheetColumnType';
import { setSubColumn } from '@/spreadsheet-import/utils/setSubColumn';

describe('setSubColumn', () => {
  it('should return a matchedSelectColumn with updated matchedOptions', () => {
    const oldColumn: SpreadsheetColumn = {
      index: 0,
      header: 'Name',
      type: SpreadsheetColumnType.matchedSelect,
      matchedOptions: [
        { entry: 'Name1', value: 'John' },
        { entry: 'Name2', value: '' },
      ],
      value: 'John',
    };

    const entry = 'Name1';
    const value = 'John Doe';
    const result = setSubColumn(oldColumn, entry, value);

    expect(result).toEqual({
      index: 0,
      header: 'Name',
      type: SpreadsheetColumnType.matchedSelect,
      matchedOptions: [
        { entry: 'Name1', value: 'John Doe' },
        { entry: 'Name2', value: '' },
      ],
      value: 'John',
    });
  });

  it('should return a matchedSelectOptionsColumn with updated matchedOptions', () => {
    const oldColumn: SpreadsheetColumn = {
      index: 0,
      header: 'Name',
      type: SpreadsheetColumnType.matchedSelectOptions,
      matchedOptions: [
        { entry: 'Name1', value: 'John' },
        { entry: 'Name2', value: 'Jane' },
      ],
      value: 'John',
    };

    const entry = 'Name1';
    const value = 'John Doe';
    const result = setSubColumn(oldColumn, entry, value);

    expect(result).toEqual({
      index: 0,
      header: 'Name',
      type: SpreadsheetColumnType.matchedSelectOptions,
      matchedOptions: [
        { entry: 'Name1', value: 'John Doe' },
        { entry: 'Name2', value: 'Jane' },
      ],
      value: 'John',
    });
  });
});
