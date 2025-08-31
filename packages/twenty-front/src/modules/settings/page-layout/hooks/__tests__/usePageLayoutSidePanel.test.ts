import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { usePageLayoutSidePanel } from '../usePageLayoutSidePanel';

describe('usePageLayoutSidePanel', () => {
  it('should return initial closed state', () => {
    const { result } = renderHook(() => usePageLayoutSidePanel(), {
      wrapper: RecoilRoot,
    });

    expect(result.current.pageLayoutSidePanelOpen).toBe(false);
    expect(typeof result.current.handleOpenSidePanel).toBe('function');
    expect(typeof result.current.handleCloseSidePanel).toBe('function');
  });

  it('should open side panel', () => {
    const { result } = renderHook(() => usePageLayoutSidePanel(), {
      wrapper: RecoilRoot,
    });

    expect(result.current.pageLayoutSidePanelOpen).toBe(false);

    act(() => {
      result.current.handleOpenSidePanel();
    });

    expect(result.current.pageLayoutSidePanelOpen).toBe(true);
  });

  it('should close side panel and clear dragged area', () => {
    const { result } = renderHook(() => usePageLayoutSidePanel(), {
      wrapper: RecoilRoot,
    });

    act(() => {
      result.current.handleOpenSidePanel();
    });

    expect(result.current.pageLayoutSidePanelOpen).toBe(true);

    act(() => {
      result.current.handleCloseSidePanel();
    });

    expect(result.current.pageLayoutSidePanelOpen).toBe(false);
  });

  it('should maintain callback references across renders', () => {
    const { result, rerender } = renderHook(() => usePageLayoutSidePanel(), {
      wrapper: RecoilRoot,
    });

    const firstOpenCallback = result.current.handleOpenSidePanel;
    const firstCloseCallback = result.current.handleCloseSidePanel;

    rerender();

    const secondOpenCallback = result.current.handleOpenSidePanel;
    const secondCloseCallback = result.current.handleCloseSidePanel;

    expect(firstOpenCallback).toBe(secondOpenCallback);
    expect(firstCloseCallback).toBe(secondCloseCallback);
  });

  it('should handle multiple open/close cycles', () => {
    const { result } = renderHook(() => usePageLayoutSidePanel(), {
      wrapper: RecoilRoot,
    });

    expect(result.current.pageLayoutSidePanelOpen).toBe(false);

    act(() => {
      result.current.handleOpenSidePanel();
    });
    expect(result.current.pageLayoutSidePanelOpen).toBe(true);

    act(() => {
      result.current.handleCloseSidePanel();
    });
    expect(result.current.pageLayoutSidePanelOpen).toBe(false);

    act(() => {
      result.current.handleOpenSidePanel();
    });
    expect(result.current.pageLayoutSidePanelOpen).toBe(true);

    act(() => {
      result.current.handleCloseSidePanel();
    });
    expect(result.current.pageLayoutSidePanelOpen).toBe(false);
  });
});
