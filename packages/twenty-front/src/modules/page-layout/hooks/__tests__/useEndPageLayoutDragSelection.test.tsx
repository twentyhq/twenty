import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconAppWindow } from 'twenty-ui/display';
import { pageLayoutDraggedAreaComponentState } from '../../states/pageLayoutDraggedAreaComponentState';
import { pageLayoutSelectedCellsComponentState } from '../../states/pageLayoutSelectedCellsComponentState';
import { calculateGridBoundsFromSelectedCells } from '../../utils/calculateGridBoundsFromSelectedCells';
import { useEndPageLayoutDragSelection } from '../useEndPageLayoutDragSelection';
import {
  PageLayoutTestWrapper,
  PAGE_LAYOUT_TEST_INSTANCE_ID,
} from './PageLayoutTestWrapper';

jest.mock('@/command-menu/hooks/useNavigateCommandMenu');
jest.mock('../../utils/calculateGridBoundsFromSelectedCells');

const createInitializeState =
  (initialSelectedCells?: Set<string>, initialDraggedArea?: any) =>
  ({ set }: { set: any }) => {
    if (isDefined(initialSelectedCells)) {
      set(
        pageLayoutSelectedCellsComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        initialSelectedCells,
      );
    }
    if (initialDraggedArea !== undefined) {
      set(
        pageLayoutDraggedAreaComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        initialDraggedArea,
      );
    }
  };

describe('useEndPageLayoutDragSelection', () => {
  const mockNavigateCommandMenu = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigateCommandMenu as jest.Mock).mockReturnValue({
      navigateCommandMenu: mockNavigateCommandMenu,
    });
  });

  it('should handle drag selection end with valid bounds', () => {
    const mockBounds = { x: 0, y: 0, w: 2, h: 2 };
    (calculateGridBoundsFromSelectedCells as jest.Mock).mockReturnValue(
      mockBounds,
    );

    const { result } = renderHook(
      () => ({
        endDragSelection: useEndPageLayoutDragSelection(
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        ),
        selectedCells: useRecoilComponentValue(
          pageLayoutSelectedCellsComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        ),
        draggedArea: useRecoilComponentValue(
          pageLayoutDraggedAreaComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        ),
      }),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <PageLayoutTestWrapper
            initializeState={createInitializeState(
              new Set(['0-0', '0-1', '1-0', '1-1']),
              null,
            )}
          >
            {children}
          </PageLayoutTestWrapper>
        ),
      },
    );

    expect(result.current.selectedCells.size).toBe(4);
    expect(result.current.draggedArea).toBeNull();

    act(() => {
      result.current.endDragSelection.endPageLayoutDragSelection();
    });

    expect(calculateGridBoundsFromSelectedCells).toHaveBeenCalledWith([
      '0-0',
      '0-1',
      '1-0',
      '1-1',
    ]);

    expect(result.current.draggedArea).toEqual(mockBounds);
    expect(result.current.selectedCells.size).toBe(0);

    expect(mockNavigateCommandMenu).toHaveBeenCalledWith({
      page: CommandMenuPages.PageLayoutWidgetTypeSelect,
      pageTitle: 'Add Widget',
      pageIcon: IconAppWindow,
      resetNavigationStack: true,
    });
  });

  it('should not navigate when no cells are selected', () => {
    (calculateGridBoundsFromSelectedCells as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(
      () => ({
        endDragSelection: useEndPageLayoutDragSelection(
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        ),
        selectedCells: useRecoilComponentValue(
          pageLayoutSelectedCellsComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        ),
        draggedArea: useRecoilComponentValue(
          pageLayoutDraggedAreaComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        ),
      }),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <PageLayoutTestWrapper
            initializeState={createInitializeState(new Set(), null)}
          >
            {children}
          </PageLayoutTestWrapper>
        ),
      },
    );

    act(() => {
      result.current.endDragSelection.endPageLayoutDragSelection();
    });

    expect(calculateGridBoundsFromSelectedCells).not.toHaveBeenCalled();
    expect(mockNavigateCommandMenu).not.toHaveBeenCalled();
    expect(result.current.draggedArea).toBeNull();
    expect(result.current.selectedCells.size).toBe(0);
  });

  it('should not navigate when bounds calculation returns null', () => {
    (calculateGridBoundsFromSelectedCells as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(
      () => ({
        endDragSelection: useEndPageLayoutDragSelection(
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        ),
        selectedCells: useRecoilComponentValue(
          pageLayoutSelectedCellsComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        ),
        draggedArea: useRecoilComponentValue(
          pageLayoutDraggedAreaComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        ),
      }),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <PageLayoutTestWrapper
            initializeState={createInitializeState(
              new Set(['invalid-cell']),
              null,
            )}
          >
            {children}
          </PageLayoutTestWrapper>
        ),
      },
    );

    act(() => {
      result.current.endDragSelection.endPageLayoutDragSelection();
    });

    expect(calculateGridBoundsFromSelectedCells).toHaveBeenCalledWith([
      'invalid-cell',
    ]);
    expect(mockNavigateCommandMenu).not.toHaveBeenCalled();
    expect(result.current.draggedArea).toBeNull();
    expect(result.current.selectedCells.size).toBe(1);
  });

  it('should return a function', () => {
    const { result } = renderHook(
      () => useEndPageLayoutDragSelection(PAGE_LAYOUT_TEST_INSTANCE_ID),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <PageLayoutTestWrapper>{children}</PageLayoutTestWrapper>
        ),
      },
    );

    expect(typeof result.current.endPageLayoutDragSelection).toBe('function');
  });

  it('should navigate to widget selection when bounds are valid', () => {
    const mockBounds = { x: 0, y: 0, w: 2, h: 2 };
    (calculateGridBoundsFromSelectedCells as jest.Mock).mockReturnValue(
      mockBounds,
    );

    const { result } = renderHook(
      () => ({
        endDragSelection: useEndPageLayoutDragSelection(
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
            initializeState={createInitializeState(new Set(['0-0']))}
          >
            {children}
          </PageLayoutTestWrapper>
        ),
      },
    );

    act(() => {
      result.current.endDragSelection.endPageLayoutDragSelection();
    });

    expect(mockNavigateCommandMenu).toHaveBeenCalled();
  });

  it('should clear selected cells after successful navigation', () => {
    const mockBounds = { x: 0, y: 0, w: 1, h: 1 };
    (calculateGridBoundsFromSelectedCells as jest.Mock).mockReturnValue(
      mockBounds,
    );

    const { result } = renderHook(
      () => ({
        endDragSelection: useEndPageLayoutDragSelection(
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
            initializeState={createInitializeState(new Set(['0-0']))}
          >
            {children}
          </PageLayoutTestWrapper>
        ),
      },
    );

    expect(result.current.selectedCells.size).toBe(1);

    act(() => {
      result.current.endDragSelection.endPageLayoutDragSelection();
    });

    expect(result.current.selectedCells.size).toBe(0);
  });
});
