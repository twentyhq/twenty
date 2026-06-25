import { getRecordTableCellId } from '@/object-record/record-table/utils/getRecordTableCellId';

describe('getRecordTableCellId', () => {
  it('returns the correct cell id format', () => {
    expect(getRecordTableCellId('my-table', 2, 5)).toBe(
      'record-table-cell-my-table-2-5',
    );
  });

  it('returns the correct cell id format with different values', () => {
    expect(getRecordTableCellId('other-table', 0, 0)).toBe(
      'record-table-cell-other-table-0-0',
    );
  });
});
