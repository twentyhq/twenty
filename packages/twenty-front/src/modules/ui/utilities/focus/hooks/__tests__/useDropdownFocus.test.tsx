import { useDropdownFocus } from '@/ui/utilities/focus/hooks/useDropdownFocus';
import { currentGlobalHotkeysConfigSelector } from '@/ui/utilities/focus/states/currentGlobalHotkeysConfigSelector';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { type FocusStackItem } from '@/ui/utilities/focus/types/FocusStackItem';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

const BACKGROUND_FOCUS_ITEM: FocusStackItem = {
  focusId: 'record-page',
  componentInstance: {
    componentType: FocusComponentType.PAGE,
    componentInstanceId: 'record-page',
  },
  globalHotkeysConfig: {
    enableGlobalHotkeysConflictingWithKeyboard: true,
    enableGlobalHotkeysWithModifiers: true,
  },
};

const createTestContext = () => {
  const store = createStore();

  store.set(focusStackState.atom, [BACKGROUND_FOCUS_ITEM]);

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>{children}</JotaiProvider>
  );

  return { store, Wrapper };
};

describe('useDropdownFocus', () => {
  it('updates focus and global shortcuts synchronously when opening and closing', () => {
    const { store, Wrapper } = createTestContext();
    const { result } = renderHook(() => useDropdownFocus(), {
      wrapper: Wrapper,
    });

    expect(store.get(focusStackState.atom)).toEqual([BACKGROUND_FOCUS_ITEM]);

    act(() => {
      result.current.updateDropdownFocus(true);

      expect(store.get(focusStackState.atom)).toEqual([
        BACKGROUND_FOCUS_ITEM,
        {
          focusId: expect.any(String),
          componentInstance: {
            componentType: FocusComponentType.DROPDOWN,
            componentInstanceId: expect.any(String),
          },
          globalHotkeysConfig: {
            enableGlobalHotkeysConflictingWithKeyboard: false,
            enableGlobalHotkeysWithModifiers: false,
          },
        },
      ]);
      expect(store.get(currentGlobalHotkeysConfigSelector.atom)).toEqual({
        enableGlobalHotkeysConflictingWithKeyboard: false,
        enableGlobalHotkeysWithModifiers: false,
      });

      result.current.updateDropdownFocus(false);

      expect(store.get(focusStackState.atom)).toEqual([BACKGROUND_FOCUS_ITEM]);
      expect(store.get(currentGlobalHotkeysConfigSelector.atom)).toEqual(
        BACKGROUND_FOCUS_ITEM.globalHotkeysConfig,
      );
    });
  });

  it('reuses its focus identity across renders and repeated opening requests', () => {
    const { store, Wrapper } = createTestContext();
    const { result, rerender } = renderHook(() => useDropdownFocus(), {
      wrapper: Wrapper,
    });

    act(() => result.current.updateDropdownFocus(true));

    const openedFocusStack = store.get(focusStackState.atom);

    rerender();

    act(() => {
      result.current.updateDropdownFocus(true);

      expect(store.get(focusStackState.atom)).toEqual(openedFocusStack);

      result.current.updateDropdownFocus(false);
      result.current.updateDropdownFocus(true);

      expect(store.get(focusStackState.atom)).toEqual(openedFocusStack);
    });
  });

  it('restores the outer dropdown entry synchronously when a nested owner closes', () => {
    const { store, Wrapper } = createTestContext();
    const outer = renderHook(() => useDropdownFocus(), { wrapper: Wrapper });
    const inner = renderHook(() => useDropdownFocus(), { wrapper: Wrapper });

    act(() => {
      outer.result.current.updateDropdownFocus(true);

      const outerFocusStack = store.get(focusStackState.atom);

      inner.result.current.updateDropdownFocus(true);

      expect(store.get(focusStackState.atom)).toHaveLength(3);

      inner.result.current.updateDropdownFocus(false);

      expect(store.get(focusStackState.atom)).toEqual(outerFocusStack);
    });
  });

  it('removes only the unmounted owner while another dropdown remains open', () => {
    const { store, Wrapper } = createTestContext();
    const outer = renderHook(() => useDropdownFocus(), { wrapper: Wrapper });
    const inner = renderHook(() => useDropdownFocus(), { wrapper: Wrapper });

    act(() => {
      outer.result.current.updateDropdownFocus(true);
      inner.result.current.updateDropdownFocus(true);
    });

    const innerFocusItem = store.get(focusStackState.atom).at(-1);

    outer.unmount();

    expect(store.get(focusStackState.atom)).toEqual([
      BACKGROUND_FOCUS_ITEM,
      innerFocusItem,
    ]);

    inner.unmount();

    expect(store.get(focusStackState.atom)).toEqual([BACKGROUND_FOCUS_ITEM]);
  });
});
