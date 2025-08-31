import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { usePageLayoutGrid } from '../usePageLayoutGrid';

describe('usePageLayoutGrid', () => {
  it('should return all required state and setters', () => {
    const { result } = renderHook(() => usePageLayoutGrid(), {
      wrapper: RecoilRoot,
    });

    expect(result.current.pageLayoutCurrentBreakpoint).toBe('desktop');
    expect(result.current.pageLayoutSelectedCells).toEqual(new Set());
    expect(result.current.pageLayoutDraggedArea).toBeNull();
    expect(result.current.pageLayoutCurrentLayouts).toEqual({
      desktop: [],
      mobile: [],
    });
    expect(result.current.pageLayoutWidgets).toEqual([]);
    expect(result.current.pageLayoutSidePanelOpen).toBe(false);

    expect(typeof result.current.setPageLayoutCurrentBreakpoint).toBe(
      'function',
    );
    expect(typeof result.current.setPageLayoutSelectedCells).toBe('function');
    expect(typeof result.current.setPageLayoutDraggedArea).toBe('function');
    expect(typeof result.current.setPageLayoutCurrentLayouts).toBe('function');
    expect(typeof result.current.setPageLayoutWidgets).toBe('function');
    expect(typeof result.current.setPageLayoutSidePanelOpen).toBe('function');
  });

  it('should update breakpoint state', () => {
    const { result } = renderHook(() => usePageLayoutGrid(), {
      wrapper: RecoilRoot,
    });

    act(() => {
      result.current.setPageLayoutCurrentBreakpoint('mobile');
    });

    expect(result.current.pageLayoutCurrentBreakpoint).toBe('mobile');
  });

  it('should update selected cells state', () => {
    const { result } = renderHook(() => usePageLayoutGrid(), {
      wrapper: RecoilRoot,
    });

    const newSelectedCells = new Set(['cell-1', 'cell-2']);

    act(() => {
      result.current.setPageLayoutSelectedCells(newSelectedCells);
    });

    expect(result.current.pageLayoutSelectedCells).toEqual(newSelectedCells);
  });

  it('should update dragged area state', () => {
    const { result } = renderHook(() => usePageLayoutGrid(), {
      wrapper: RecoilRoot,
    });

    const draggedArea = { x: 0, y: 0, w: 2, h: 2 };

    act(() => {
      result.current.setPageLayoutDraggedArea(draggedArea);
    });

    expect(result.current.pageLayoutDraggedArea).toEqual(draggedArea);
  });

  it('should update layouts state', () => {
    const { result } = renderHook(() => usePageLayoutGrid(), {
      wrapper: RecoilRoot,
    });

    const newLayouts = {
      desktop: [{ i: 'widget-1', x: 0, y: 0, w: 2, h: 2 }],
      mobile: [{ i: 'widget-1', x: 0, y: 0, w: 1, h: 2 }],
    };

    act(() => {
      result.current.setPageLayoutCurrentLayouts(newLayouts);
    });

    expect(result.current.pageLayoutCurrentLayouts).toEqual(newLayouts);
  });

  it('should update widgets state', () => {
    const { result } = renderHook(() => usePageLayoutGrid(), {
      wrapper: RecoilRoot,
    });

    const newWidgets = [
      {
        id: 'widget-1',
        title: 'Test Widget',
        type: 'GRAPH' as const,
        graphType: 'bar' as const,
        data: {},
      },
    ];

    act(() => {
      result.current.setPageLayoutWidgets(newWidgets);
    });

    expect(result.current.pageLayoutWidgets).toEqual(newWidgets);
  });

  it('should update side panel open state', () => {
    const { result } = renderHook(() => usePageLayoutGrid(), {
      wrapper: RecoilRoot,
    });

    act(() => {
      result.current.setPageLayoutSidePanelOpen(true);
    });

    expect(result.current.pageLayoutSidePanelOpen).toBe(true);

    act(() => {
      result.current.setPageLayoutSidePanelOpen(false);
    });

    expect(result.current.pageLayoutSidePanelOpen).toBe(false);
  });
});
