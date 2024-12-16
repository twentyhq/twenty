import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { RecordTableComponentInstance } from '@/object-record/record-table/components/RecordTableComponentInstance';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableRowContextProvider } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableRowDraggableContextProvider } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import {
  recordTableCellContextValue,
  recordTableRowContextValue,
  recordTableRowDraggableContextValue,
} from '@/object-record/record-table/record-table-cell/hooks/__mocks__/cell';
import { useIsSoftFocusOnCurrentTableCell } from '@/object-record/record-table/record-table-cell/hooks/useIsSoftFocusOnCurrentTableCell';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot>
    <RecordTableComponentInstance
      recordTableId="scopeId"
      onColumnsChange={jest.fn()}
    >
      <RecordTableRowContextProvider value={recordTableRowContextValue}>
        <RecordTableRowDraggableContextProvider
          value={recordTableRowDraggableContextValue}
        >
          <RecordTableCellContext.Provider value={recordTableCellContextValue}>
            {children}
          </RecordTableCellContext.Provider>
        </RecordTableRowDraggableContextProvider>
      </RecordTableRowContextProvider>
    </RecordTableComponentInstance>
  </RecoilRoot>
);

describe('useIsSoftFocusOnCurrentTableCell', () => {
  it('should work as expected', () => {
    const { result } = renderHook(() => useIsSoftFocusOnCurrentTableCell(), {
      wrapper: Wrapper,
    });

    expect(result.current).toBe(false);
  });
});
