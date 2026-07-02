import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode, act } from 'react';

import { useDisableDragSelectOnPointerDown } from '@/ui/utilities/drag-select/hooks/useDisableDragSelectOnPointerDown';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const renderDisableDragSelectHook = () =>
  renderHook(
    () => ({
      disableDragSelect: useDisableDragSelectOnPointerDown(),
      dragSelect: useDragSelect(),
    }),
    {
      wrapper: Wrapper,
    },
  );

describe('useDisableDragSelectOnPointerDown', () => {
  it('should disable drag select on pointerdown and restores it on pointerup on document', () => {
    const { result } = renderDisableDragSelectHook();

    act(() => {
      result.current.disableDragSelect.onPointerDown();
    });

    expect(result.current.dragSelect.isDragSelectionStartEnabled()).toBe(false);

    act(() => {
      document.dispatchEvent(new Event('pointerup'));
    });

    expect(result.current.dragSelect.isDragSelectionStartEnabled()).toBe(true);
  });

  it('should restore drag select on unmount if pointerup never returns', () => {
    const { result, unmount } = renderDisableDragSelectHook();

    act(() => {
      result.current.disableDragSelect.onPointerDown();
    });

    expect(result.current.dragSelect.isDragSelectionStartEnabled()).toBe(false);

    act(() => {
      unmount();
    });

    const { result: nextResult } = renderHook(() => useDragSelect(), {
      wrapper: Wrapper,
    });

    expect(nextResult.current.isDragSelectionStartEnabled()).toBe(true);
  });
});
