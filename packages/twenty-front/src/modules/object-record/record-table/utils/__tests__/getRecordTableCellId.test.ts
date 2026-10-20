import { getRecordTableCellId } from '@/object-record/record-table/utils/getRecordTableCellId';

describe('getRecordTableCellId', () => {
  it('returns the correct cell id format', () => {
    expect(
      getRecordTableCellId({
        recordTableId: 'my-table',
        columnIndex: 2,
        recordId: 'record-id',
      }),
    ).toBe('record-table-cell-my-table-2-record-id');
  });
});
