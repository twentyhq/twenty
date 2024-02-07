import { renderHook } from '@testing-library/react';

import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';

import { recordTableCell, recordTableRow } from '../__mocks__/cell';
import { useCurrentTableCellPosition } from '../useCurrentCellPosition';

describe('useCurrentTableCellPosition', () => {
  it('should return the current table cell position', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RecordTableRowContext.Provider value={recordTableRow}>
        <RecordTableCellContext.Provider value={recordTableCell}>
          {children}
        </RecordTableCellContext.Provider>
      </RecordTableRowContext.Provider>
    );

    const { result } = renderHook(() => useCurrentTableCellPosition(), {
      wrapper,
    });

    expect(result.current).toEqual({
      column: 3,
      row: 2,
    });
  });
});
