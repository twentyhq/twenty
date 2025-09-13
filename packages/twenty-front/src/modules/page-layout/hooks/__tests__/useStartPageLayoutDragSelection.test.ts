import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { RecoilRoot, useRecoilValue } from 'recoil';
import { pageLayoutSelectedCellsState } from '../../states/pageLayoutSelectedCellsState';
import { useStartPageLayoutDragSelection } from '../useStartPageLayoutDragSelection';

describe('useStartPageLayoutDragSelection', () => {
  it('should clear selected cells when starting drag selection', () => {
    const { result } = renderHook(
      () => ({
        startDragSelection: useStartPageLayoutDragSelection(),
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
    expect(result.current.selectedCells.has('cell-1')).toBe(true);
    expect(result.current.selectedCells.has('cell-2')).toBe(true);

    act(() => {
      result.current.startDragSelection.startPageLayoutDragSelection();
    });

    expect(result.current.selectedCells.size).toBe(0);
  });

  it('should return a function', () => {
    const { result } = renderHook(() => useStartPageLayoutDragSelection(), {
      wrapper: RecoilRoot,
    });

    expect(typeof result.current.startPageLayoutDragSelection).toBe('function');
  });

  it('should handle multiple calls correctly', () => {
    const { result } = renderHook(
      () => ({
        startDragSelection: useStartPageLayoutDragSelection(),
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
      result.current.startDragSelection.startPageLayoutDragSelection();
    });
    expect(result.current.selectedCells.size).toBe(0);

    act(() => {
      result.current.startDragSelection.startPageLayoutDragSelection();
    });
    expect(result.current.selectedCells.size).toBe(0);
  });
});
