import { renderHook } from '@testing-library/react';

import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableRowContextProvider } from '@/object-record/record-table/contexts/RecordTableRowContext';

import { RecordTableRowDraggableContextProvider } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import {
  recordTableCellContextValue,
  recordTableRowContextValue,
  recordTableRowDraggableContextValue,
} from '@/object-record/record-table/record-table-cell/hooks/__mocks__/cell';
import { useCurrentTableCellPosition } from '../useCurrentCellPosition';

describe('useCurrentTableCellPosition', () => {
  it('should return the current table cell position', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RecordTableRowContextProvider value={recordTableRowContextValue}>
        <RecordTableRowDraggableContextProvider
          value={recordTableRowDraggableContextValue}
        >
          <RecordTableCellContext.Provider value={recordTableCellContextValue}>
            {children}
          </RecordTableCellContext.Provider>
        </RecordTableRowDraggableContextProvider>
      </RecordTableRowContextProvider>
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
