import { getCoreObjectTableSelectionStatus } from '@/object-core/utils/getCoreObjectTableSelectionStatus';

describe('getCoreObjectTableSelectionStatus', () => {
  it('should report all rows selected when every row is selected', () => {
    expect(
      getCoreObjectTableSelectionStatus({
        rowIds: ['a', 'b'],
        selectedRowIds: ['a', 'b'],
      }),
    ).toEqual({ areAllRowsSelected: true, areSomeRowsSelected: false });
  });

  it('should report some rows selected when only part of the table is selected', () => {
    expect(
      getCoreObjectTableSelectionStatus({
        rowIds: ['a', 'b'],
        selectedRowIds: ['a'],
      }),
    ).toEqual({ areAllRowsSelected: false, areSomeRowsSelected: true });
  });

  it('should report nothing selected for an empty selection', () => {
    expect(
      getCoreObjectTableSelectionStatus({
        rowIds: ['a', 'b'],
        selectedRowIds: [],
      }),
    ).toEqual({ areAllRowsSelected: false, areSomeRowsSelected: false });
  });

  it('should ignore selected rows that are not in the table', () => {
    expect(
      getCoreObjectTableSelectionStatus({
        rowIds: ['a', 'b'],
        selectedRowIds: ['a', 'b', 'filtered-out'],
      }),
    ).toEqual({ areAllRowsSelected: true, areSomeRowsSelected: false });
  });

  it('should not report all rows selected for an empty table', () => {
    expect(
      getCoreObjectTableSelectionStatus({
        rowIds: [],
        selectedRowIds: ['stale'],
      }),
    ).toEqual({ areAllRowsSelected: false, areSomeRowsSelected: false });
  });
});
