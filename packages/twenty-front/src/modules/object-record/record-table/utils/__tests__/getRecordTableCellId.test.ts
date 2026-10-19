import { getRecordTableCellId } from '@/object-record/record-table/utils/getRecordTableCellId';

describe('getRecordTableCellId', () => {
  it('returns the correct cell id format', () => {
    expect(getRecordTableCellId('my-table', 2, 'record-id')).toBe(
      'record-table-cell-my-table-2-record-id',
    );
  });
});
