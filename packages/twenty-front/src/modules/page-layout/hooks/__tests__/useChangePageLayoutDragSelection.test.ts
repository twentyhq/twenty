import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { RecoilRoot, useRecoilValue } from 'recoil';
import { pageLayoutSelectedCellsState } from '../../states/pageLayoutSelectedCellsState';
import { useChangePageLayoutDragSelection } from '../useChangePageLayoutDragSelection';

describe('useChangePageLayoutDragSelection', () => {
  it('should add cell to selection when selected is true', () => {
    const { result } = renderHook(
      () => ({
        changeDragSelection: useChangePageLayoutDragSelection(),
        selectedCells: useRecoilValue(pageLayoutSelectedCellsState),
      }),
      {
        wrapper: ({ children }: { children: ReactNode }) =>
          RecoilRoot({
            initializeState: ({ set }) => {
              set(pageLayoutSelectedCellsState, new Set(['cell-1']));
            },
            children,
          }),
      },
    );

    expect(result.current.selectedCells.size).toBe(1);
    expect(result.current.selectedCells.has('cell-2')).toBe(false);

    act(() => {
      result.current.changeDragSelection.changePageLayoutDragSelection(
        'cell-2',
        true,
      );
    });

    expect(result.current.selectedCells.size).toBe(2);
    expect(result.current.selectedCells.has('cell-1')).toBe(true);
    expect(result.current.selectedCells.has('cell-2')).toBe(true);
  });

  it('should remove cell from selection when selected is false', () => {
    const { result } = renderHook(
      () => ({
        changeDragSelection: useChangePageLayoutDragSelection(),
        selectedCells: useRecoilValue(pageLayoutSelectedCellsState),
      }),
      {
        wrapper: ({ children }: { children: ReactNode }) =>
          RecoilRoot({
            initializeState: ({ set }) => {
              set(pageLayoutSelectedCellsState, new Set(['cell-1', 'cell-2']));
            },
            children,
          }),
      },
    );

    expect(result.current.selectedCells.size).toBe(2);
    expect(result.current.selectedCells.has('cell-2')).toBe(true);

    act(() => {
      result.current.changeDragSelection.changePageLayoutDragSelection(
        'cell-2',
        false,
      );
    });

    expect(result.current.selectedCells.size).toBe(1);
    expect(result.current.selectedCells.has('cell-1')).toBe(true);
    expect(result.current.selectedCells.has('cell-2')).toBe(false);
  });

  it('should handle adding same cell multiple times', () => {
    const { result } = renderHook(
      () => ({
        changeDragSelection: useChangePageLayoutDragSelection(),
        selectedCells: useRecoilValue(pageLayoutSelectedCellsState),
      }),
      {
        wrapper: RecoilRoot,
      },
    );

    act(() => {
      result.current.changeDragSelection.changePageLayoutDragSelection(
        'cell-1',
        true,
      );
    });
    expect(result.current.selectedCells.size).toBe(1);

    act(() => {
      result.current.changeDragSelection.changePageLayoutDragSelection(
        'cell-1',
        true,
      );
    });
    expect(result.current.selectedCells.size).toBe(1);
  });

  it('should handle removing non-existent cell', () => {
    const { result } = renderHook(
      () => ({
        changeDragSelection: useChangePageLayoutDragSelection(),
        selectedCells: useRecoilValue(pageLayoutSelectedCellsState),
      }),
      {
        wrapper: ({ children }: { children: ReactNode }) =>
          RecoilRoot({
            initializeState: ({ set }) => {
              set(pageLayoutSelectedCellsState, new Set(['cell-1']));
            },
            children,
          }),
      },
    );

    expect(result.current.selectedCells.size).toBe(1);

    act(() => {
      result.current.changeDragSelection.changePageLayoutDragSelection(
        'cell-99',
        false,
      );
    });

    expect(result.current.selectedCells.size).toBe(1);
    expect(result.current.selectedCells.has('cell-1')).toBe(true);
  });

  it('should return a function', () => {
    const { result } = renderHook(() => useChangePageLayoutDragSelection(), {
      wrapper: RecoilRoot,
    });

    expect(typeof result.current.changePageLayoutDragSelection).toBe(
      'function',
    );
  });
});
