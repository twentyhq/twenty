import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider, useAtomValue } from 'jotai';
import { act } from 'react';

import { RecordTableComponentInstance } from '@/object-record/record-table/components/RecordTableComponentInstance';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
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

jest.mock('react-responsive', () => ({
  useMediaQuery: jest.fn(),
}));

const mockUseMediaQuery = jest.requireMock('react-responsive')
  .useMediaQuery as jest.Mock;

const mockIsTouchDevice = (isTouchDevice: boolean) => {
  mockUseMediaQuery.mockImplementation(({ query }: { query: string }) =>
    query.includes('hover: none') ? isTouchDevice : false,
  );
};

const createWrapper =
  (recordTableId: string) =>
  ({ children }: { children: React.ReactNode }) => (
    <JotaiProvider store={jotaiStore}>
      <RecordTableComponentInstance recordTableId={recordTableId}>
        <RecordTableRowContextProvider value={recordTableRowContextValue}>
          <RecordTableRowDraggableContextProvider
            value={recordTableRowDraggableContextValue}
          >
            <RecordTableCellContext.Provider
              value={recordTableCellContextValue}
            >
              {children}
            </RecordTableCellContext.Provider>
          </RecordTableRowDraggableContextProvider>
        </RecordTableRowContextProvider>
      </RecordTableComponentInstance>
    </JotaiProvider>
  );

const renderMoveHoverToCurrentCell = (recordTableId: string) =>
  renderHook(
    () => {
      const recordTableHoverPosition = useAtomValue(
        recordTableHoverPositionComponentState.atomFamily({
          instanceId: recordTableId,
        }),
      );
      const { moveHoverToCurrentCell } =
        useMoveHoverToCurrentCell(recordTableId);

      return {
        moveHoverToCurrentCell,
        recordTableHoverPosition,
      };
    },
    {
      wrapper: createWrapper(recordTableId),
    },
  );

describe('useMoveHoverToCurrentCell', () => {
  it('should work as expected', () => {
    mockIsTouchDevice(false);

    const { result } = renderMoveHoverToCurrentCell('test-pointer-fine');

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

  it('should not track hover on touch devices', () => {
    mockIsTouchDevice(true);

    const { result } = renderMoveHoverToCurrentCell('test-pointer-coarse');

    act(() => {
      result.current.moveHoverToCurrentCell({
        column: 1,
        row: 1,
      });
    });

    expect(result.current.recordTableHoverPosition).toBeNull();
  });
});
