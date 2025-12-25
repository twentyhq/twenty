import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { pageLayoutSelectedCellsComponentState } from '@/page-layout/states/pageLayoutSelectedCellsComponentState';
import { useStartPageLayoutDragSelection } from '@/page-layout/hooks/useStartPageLayoutDragSelection';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from './PageLayoutTestWrapper';

const createInitializeState =
  (initialSelectedCells?: Set<string>) =>
  ({ set }: { set: any }) => {
    if (isDefined(initialSelectedCells)) {
      set(
        pageLayoutSelectedCellsComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        initialSelectedCells,
      );
    }
  };

describe('useStartPageLayoutDragSelection', () => {
  it('should clear selected cells when starting drag selection', () => {
    const { result } = renderHook(
      () => ({
        startDragSelection: useStartPageLayoutDragSelection(
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        ),
        selectedCells: useRecoilComponentValue(
          pageLayoutSelectedCellsComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        ),
      }),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <PageLayoutTestWrapper
            initializeState={createInitializeState(
              new Set(['cell-1', 'cell-2']),
            )}
          >
            {children}
          </PageLayoutTestWrapper>
        ),
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
    const { result } = renderHook(
      () => useStartPageLayoutDragSelection(PAGE_LAYOUT_TEST_INSTANCE_ID),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <PageLayoutTestWrapper>{children}</PageLayoutTestWrapper>
        ),
      },
    );

    expect(typeof result.current.startPageLayoutDragSelection).toBe('function');
  });

  it('should handle multiple calls correctly', () => {
    const { result } = renderHook(
      () => ({
        startDragSelection: useStartPageLayoutDragSelection(
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        ),
        selectedCells: useRecoilComponentValue(
          pageLayoutSelectedCellsComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        ),
      }),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <PageLayoutTestWrapper
            initializeState={createInitializeState(new Set(['cell-1']))}
          >
            {children}
          </PageLayoutTestWrapper>
        ),
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
