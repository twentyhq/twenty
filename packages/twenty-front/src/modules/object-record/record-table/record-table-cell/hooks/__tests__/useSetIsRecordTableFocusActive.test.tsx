import { renderHook } from '@testing-library/react';
import React, { act } from 'react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { RecordTableComponentInstance } from '@/object-record/record-table/components/RecordTableComponentInstance';
import { useSetIsRecordTableCellFocusActive } from '@/object-record/record-table/record-table-cell/hooks/useSetIsRecordTableCellFocusActive';
import { isRecordTableCellFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableCellFocusActiveComponentState';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';

const mockClassList = {
  add: jest.fn(),
  remove: jest.fn(),
};

const mockGetElementById = jest.spyOn(document, 'getElementById');

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot
    initializeState={({ set }) => {
      set(
        isRecordTableCellFocusActiveComponentState.atomFamily({
          instanceId: 'test-table-id',
        }),
        false,
      );
      set(
        recordTableFocusPositionComponentState.atomFamily({
          instanceId: 'test-table-id',
        }),
        {
          column: 1,
          row: 0,
        },
      );
    }}
  >
    <RecordTableComponentInstance recordTableId="test-table-id">
      {children}
    </RecordTableComponentInstance>
  </RecoilRoot>
);

const renderHooks = () => {
  const { result } = renderHook(
    () => {
      const { setIsRecordTableCellFocusActive } =
        useSetIsRecordTableCellFocusActive('test-table-id');

      const isRecordTableFocusActive = useRecoilValue(
        isRecordTableCellFocusActiveComponentState.atomFamily({
          instanceId: 'test-table-id',
        }),
      );

      const focusPosition = useRecoilValue(
        recordTableFocusPositionComponentState.atomFamily({
          instanceId: 'test-table-id',
        }),
      );
      return {
        setIsRecordTableCellFocusActive,
        isRecordTableFocusActive,
        focusPosition,
      };
    },
    { wrapper: Wrapper },
  );

  return { result };
};

describe('useSetIsRecordTableFocusActive', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetElementById.mockReturnValue({
      classList: mockClassList,
    } as unknown as HTMLElement);
  });

  it('should set focus active state and add class to cell element when focus is activated', () => {
    const { result } = renderHooks();

    const cellPosition: TableCellPosition = { column: 1, row: 0 };

    act(() => {
      result.current.setIsRecordTableCellFocusActive({
        isRecordTableFocusActive: true,
        cellPosition,
      });
    });

    expect(result.current.isRecordTableFocusActive).toBe(true);

    expect(result.current.focusPosition).toEqual(cellPosition);
  });

  it('should remove focus-active class when focus is deactivated and update isRecordTableCellFocusActiveComponentState', () => {
    const { result } = renderHooks();

    const cellPosition: TableCellPosition = { column: 1, row: 0 };

    act(() => {
      result.current.setIsRecordTableCellFocusActive({
        isRecordTableFocusActive: false,
        cellPosition,
      });
    });

    expect(result.current.isRecordTableFocusActive).toBe(false);

    expect(result.current.focusPosition).toEqual(null);
  });

  it('should handle case when the cell element is not found', () => {
    mockGetElementById.mockReturnValue(null);

    const { result } = renderHooks();

    const cellPosition: TableCellPosition = { column: 1, row: 0 };

    act(() => {
      result.current.setIsRecordTableCellFocusActive({
        isRecordTableFocusActive: true,
        cellPosition,
      });
    });

    expect(result.current.isRecordTableFocusActive).toBe(true);

    expect(result.current.focusPosition).toEqual(cellPosition);
  });
});
