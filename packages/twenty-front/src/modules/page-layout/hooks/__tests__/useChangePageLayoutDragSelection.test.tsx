import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { act, renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import { pageLayoutSelectedCellsComponentState } from '@/page-layout/states/pageLayoutSelectedCellsComponentState';
import {
  PageLayoutTestWrapper,
  PAGE_LAYOUT_TEST_INSTANCE_ID,
} from './PageLayoutTestWrapper';
import { useChangePageLayoutDragSelection } from '@/page-layout/hooks/useChangePageLayoutDragSelection';

describe('useChangePageLayoutDragSelection', () => {
  it('should add cell to selection when selected is true', () => {
    const store = createStore();
    store.set(
      pageLayoutSelectedCellsComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      new Set(['cell-1']),
    );

    const { result } = renderHook(
      () => ({
        changeDragSelection: useChangePageLayoutDragSelection(
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        ),
        selectedCells: useAtomComponentStateValue(
          pageLayoutSelectedCellsComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        ),
      }),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <PageLayoutTestWrapper store={store}>
            {children}
          </PageLayoutTestWrapper>
        ),
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
    const store = createStore();
    store.set(
      pageLayoutSelectedCellsComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      new Set(['cell-1', 'cell-2']),
    );

    const { result } = renderHook(
      () => ({
        changeDragSelection: useChangePageLayoutDragSelection(
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        ),
        selectedCells: useAtomComponentStateValue(
          pageLayoutSelectedCellsComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        ),
      }),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <PageLayoutTestWrapper store={store}>
            {children}
          </PageLayoutTestWrapper>
        ),
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
        changeDragSelection: useChangePageLayoutDragSelection(
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        ),
        selectedCells: useAtomComponentStateValue(
          pageLayoutSelectedCellsComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        ),
      }),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <PageLayoutTestWrapper>{children}</PageLayoutTestWrapper>
        ),
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
    const store = createStore();
    store.set(
      pageLayoutSelectedCellsComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      new Set(['cell-1']),
    );

    const { result } = renderHook(
      () => ({
        changeDragSelection: useChangePageLayoutDragSelection(
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        ),
        selectedCells: useAtomComponentStateValue(
          pageLayoutSelectedCellsComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        ),
      }),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <PageLayoutTestWrapper store={store}>
            {children}
          </PageLayoutTestWrapper>
        ),
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
    const { result } = renderHook(
      () => useChangePageLayoutDragSelection(PAGE_LAYOUT_TEST_INSTANCE_ID),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <PageLayoutTestWrapper>{children}</PageLayoutTestWrapper>
        ),
      },
    );

    expect(typeof result.current.changePageLayoutDragSelection).toBe(
      'function',
    );
  });
});
