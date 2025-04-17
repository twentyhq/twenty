import { renderHook } from '@testing-library/react';
import React, { act } from 'react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { RecordTableComponentInstance } from '@/object-record/record-table/components/RecordTableComponentInstance';
import { useSetIsRecordTableFocusActive } from '@/object-record/record-table/record-table-cell/hooks/useSetIsRecordTableFocusActive';
import { isRecordTableFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableFocusActiveComponentState';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';

const mockClassList = {
  add: jest.fn(),
  remove: jest.fn(),
};

const mockGetElementById = jest.spyOn(document, 'getElementById');

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot
    initializeState={({ set }) => {
      set(
        isRecordTableFocusActiveComponentState.atomFamily({
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
    <RecordTableComponentInstance
      recordTableId="test-table-id"
      onColumnsChange={jest.fn()}
    >
      {children}
    </RecordTableComponentInstance>
  </RecoilRoot>
);

const renderHooks = () => {
  const { result } = renderHook(
    () => {
      const { setIsFocusActive, setIsFocusActiveForCurrentPosition } =
        useSetIsRecordTableFocusActive('test-table-id');
      const isRecordTableFocusActive = useRecoilValue(
        isRecordTableFocusActiveComponentState.atomFamily({
          instanceId: 'test-table-id',
        }),
      );
      const focusPosition = useRecoilValue(
        recordTableFocusPositionComponentState.atomFamily({
          instanceId: 'test-table-id',
        }),
      );
      return {
        setIsFocusActive,
        setIsFocusActiveForCurrentPosition,
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
      result.current.setIsFocusActive(true, cellPosition);
    });

    expect(mockGetElementById).toHaveBeenCalledWith('record-table-cell-1-0');

    expect(mockClassList.add).toHaveBeenCalledWith('focus-active');

    expect(result.current.isRecordTableFocusActive).toBe(true);

    expect(result.current.focusPosition).toEqual(cellPosition);
  });

  it('should remove focus-active class when focus is deactivated and update isRecordTableFocusActiveComponentState', () => {
    const { result } = renderHooks();

    const cellPosition: TableCellPosition = { column: 1, row: 0 };

    act(() => {
      result.current.setIsFocusActive(false, cellPosition);
    });

    expect(mockGetElementById).toHaveBeenCalledWith('record-table-cell-1-0');

    expect(mockClassList.remove).toHaveBeenCalledWith('focus-active');

    expect(result.current.isRecordTableFocusActive).toBe(false);

    expect(result.current.focusPosition).toEqual(cellPosition);
  });

  it('should set focus for current position', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.setIsFocusActiveForCurrentPosition(true);
    });

    expect(mockGetElementById).toHaveBeenCalledWith('record-table-cell-1-0');

    expect(mockClassList.add).toHaveBeenCalledWith('focus-active');

    expect(result.current.isRecordTableFocusActive).toBe(true);

    expect(result.current.focusPosition).toEqual({ column: 1, row: 0 });
  });

  it('should handle case when the cell element is not found', () => {
    mockGetElementById.mockReturnValue(null);

    const { result } = renderHooks();

    const cellPosition: TableCellPosition = { column: 1, row: 0 };

    act(() => {
      result.current.setIsFocusActive(true, cellPosition);
    });

    expect(mockGetElementById).toHaveBeenCalledWith('record-table-cell-1-0');

    expect(mockClassList.add).not.toHaveBeenCalled();

    expect(result.current.isRecordTableFocusActive).toBe(true);

    expect(result.current.focusPosition).toEqual(cellPosition);
  });
});
