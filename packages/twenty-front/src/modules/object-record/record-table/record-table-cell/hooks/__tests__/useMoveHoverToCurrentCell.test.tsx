import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { RecordTableComponentInstance } from '@/object-record/record-table/components/RecordTableComponentInstance';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableRowContextProvider } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableRowDraggableContextProvider } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import {
  recordTableCellContextValue,
  recordTableRowContextValue,
  recordTableRowDraggableContextValue,
} from '@/object-record/record-table/record-table-cell/hooks/__mocks__/cell';
import { useMoveHoverToCurrentCell } from '@/object-record/record-table/record-table-cell/hooks/useMoveHoverToCurrentCell';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot>
    <RecordTableComponentInstance recordTableId="test-record-table-instance-id">
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

describe('useMoveHoverToCurrentCell', () => {
  it('should work as expected', () => {
    const { result } = renderHook(
      () => {
        const recordTableHoverPosition = useRecoilValue(
          recordTableHoverPositionComponentState.atomFamily({
            instanceId: 'test-record-table-instance-id',
          }),
        );
        const { moveHoverToCurrentCell } = useMoveHoverToCurrentCell(
          'test-record-table-instance-id',
        );

        return {
          moveHoverToCurrentCell,
          recordTableHoverPosition,
        };
      },
      {
        wrapper: Wrapper,
      },
    );

    act(() => {
      result.current.moveHoverToCurrentCell({
        column: 3,
        row: 2,
      });
    });

    expect(result.current.recordTableHoverPosition).toEqual({
      column: 3,
      row: 2,
    });
  });
});
