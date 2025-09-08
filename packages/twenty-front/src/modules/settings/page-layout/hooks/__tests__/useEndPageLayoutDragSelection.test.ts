import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { RecoilRoot, useRecoilValue } from 'recoil';
import { IconAppWindow } from 'twenty-ui/display';
import { pageLayoutCurrentTabIdForCreationState } from '../../states/pageLayoutCurrentTabIdForCreation';
import { pageLayoutDraggedAreaState } from '../../states/pageLayoutDraggedAreaState';
import { pageLayoutSelectedCellsState } from '../../states/pageLayoutSelectedCellsState';
import { calculateGridBoundsFromSelectedCells } from '../../utils/calculateGridBoundsFromSelectedCells';
import { useEndPageLayoutDragSelection } from '../useEndPageLayoutDragSelection';

jest.mock('@/command-menu/hooks/useNavigateCommandMenu');
jest.mock('../../utils/calculateGridBoundsFromSelectedCells');

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
        endDragSelection: useEndPageLayoutDragSelection(),
        selectedCells: useRecoilValue(pageLayoutSelectedCellsState),
        draggedArea: useRecoilValue(pageLayoutDraggedAreaState),
      }),
      {
        wrapper: ({ children }: { children: ReactNode }) =>
          RecoilRoot({
            initializeState: ({ set }) => {
              set(
                pageLayoutSelectedCellsState,
                new Set(['0-0', '0-1', '1-0', '1-1']),
              );
              set(pageLayoutDraggedAreaState, null);
            },
            children,
          }),
      },
    );

    expect(result.current.selectedCells.size).toBe(4);
    expect(result.current.draggedArea).toBeNull();

    act(() => {
      result.current.endDragSelection.endPageLayoutDragSelection('test-tab-id');
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
        endDragSelection: useEndPageLayoutDragSelection(),
        selectedCells: useRecoilValue(pageLayoutSelectedCellsState),
        draggedArea: useRecoilValue(pageLayoutDraggedAreaState),
      }),
      {
        wrapper: ({ children }: { children: ReactNode }) =>
          RecoilRoot({
            initializeState: ({ set }) => {
              set(pageLayoutSelectedCellsState, new Set());
              set(pageLayoutDraggedAreaState, null);
            },
            children,
          }),
      },
    );

    act(() => {
      result.current.endDragSelection.endPageLayoutDragSelection('test-tab-id');
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
        endDragSelection: useEndPageLayoutDragSelection(),
        selectedCells: useRecoilValue(pageLayoutSelectedCellsState),
        draggedArea: useRecoilValue(pageLayoutDraggedAreaState),
      }),
      {
        wrapper: ({ children }: { children: ReactNode }) =>
          RecoilRoot({
            initializeState: ({ set }) => {
              set(pageLayoutSelectedCellsState, new Set(['invalid-cell']));
              set(pageLayoutDraggedAreaState, null);
            },
            children,
          }),
      },
    );

    act(() => {
      result.current.endDragSelection.endPageLayoutDragSelection('test-tab-id');
    });

    expect(calculateGridBoundsFromSelectedCells).toHaveBeenCalledWith([
      'invalid-cell',
    ]);
    expect(mockNavigateCommandMenu).not.toHaveBeenCalled();
    expect(result.current.draggedArea).toBeNull();
    expect(result.current.selectedCells.size).toBe(1);
  });

  it('should return a function', () => {
    const { result } = renderHook(() => useEndPageLayoutDragSelection(), {
      wrapper: RecoilRoot,
    });

    expect(typeof result.current.endPageLayoutDragSelection).toBe('function');
  });

  it('should set the active tab for widget creation', () => {
    const mockBounds = { x: 0, y: 0, w: 2, h: 2 };
    (calculateGridBoundsFromSelectedCells as jest.Mock).mockReturnValue(
      mockBounds,
    );

    const { result } = renderHook(
      () => ({
        endDragSelection: useEndPageLayoutDragSelection(),
        selectedCells: useRecoilValue(pageLayoutSelectedCellsState),
        currentTabForCreation: useRecoilValue(
          pageLayoutCurrentTabIdForCreationState,
        ),
      }),
      {
        wrapper: ({ children }: { children: ReactNode }) =>
          RecoilRoot({
            initializeState: ({ set }) => {
              set(pageLayoutSelectedCellsState, new Set(['0-0']));
              set(pageLayoutCurrentTabIdForCreationState, null);
            },
            children,
          }),
      },
    );

    expect(result.current.currentTabForCreation).toBeNull();

    act(() => {
      result.current.endDragSelection.endPageLayoutDragSelection('tab-123');
    });

    expect(result.current.currentTabForCreation).toBe('tab-123');
    expect(mockNavigateCommandMenu).toHaveBeenCalled();
  });

  it('should clear selected cells after successful navigation', () => {
    const mockBounds = { x: 0, y: 0, w: 1, h: 1 };
    (calculateGridBoundsFromSelectedCells as jest.Mock).mockReturnValue(
      mockBounds,
    );

    const { result } = renderHook(
      () => ({
        endDragSelection: useEndPageLayoutDragSelection(),
        selectedCells: useRecoilValue(pageLayoutSelectedCellsState),
      }),
      {
        wrapper: ({ children }: { children: ReactNode }) =>
          RecoilRoot({
            initializeState: ({ set }) => {
              set(pageLayoutSelectedCellsState, new Set(['0-0']));
            },
            children,
          }),
      },
    );

    expect(result.current.selectedCells.size).toBe(1);

    act(() => {
      result.current.endDragSelection.endPageLayoutDragSelection('test-tab-id');
    });

    expect(result.current.selectedCells.size).toBe(0);
  });
});
