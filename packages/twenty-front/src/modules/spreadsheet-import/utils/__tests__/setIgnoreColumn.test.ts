import { type SpreadsheetColumn } from '@/spreadsheet-import/types/SpreadsheetColumn';
import { SpreadsheetColumnType } from '@/spreadsheet-import/types/SpreadsheetColumnType';
import { setIgnoreColumn } from '@/spreadsheet-import/utils/setIgnoreColumn';

describe('setIgnoreColumn', () => {
  it('should return a column with type "ignored"', () => {
    const column: SpreadsheetColumn = {
      index: 0,
      header: 'Name',
      type: SpreadsheetColumnType.matched,
      value: 'John',
    };
    const result = setIgnoreColumn(column);
    expect(result).toEqual({
      index: 0,
      header: 'Name',
      type: SpreadsheetColumnType.ignored,
    });
  });
});
