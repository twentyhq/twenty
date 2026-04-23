import { uniqueEntries } from '@/spreadsheet-import/utils/uniqueEntries';

describe('uniqueEntries', () => {
  it('should return unique entries from the specified column index', () => {
    const data = [['John'], ['Alice'], ['John']];
    const columnIndex = 0;

    const result = uniqueEntries(data, columnIndex);

    expect(result).toStrictEqual([{ entry: 'John' }, { entry: 'Alice' }]);
  });
});
