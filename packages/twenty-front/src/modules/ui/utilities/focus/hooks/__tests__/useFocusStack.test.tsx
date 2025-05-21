import { useFocusStack } from '@/ui/utilities/focus/hooks/useFocusStack';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdSelector';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { RecoilRoot, useRecoilValue } from 'recoil';

const renderHooks = () => {
  const { result } = renderHook(
    () => {
      const {
        pushFocusItem,
        removeFocusId,
        resetFocusStack,
        resetFocusStackToFocusItem,
      } = useFocusStack();

      const focusStack = useRecoilValue(focusStackState);
      const currentFocusId = useRecoilValue(currentFocusIdSelector);

      return {
        pushFocusItem,
        removeFocusId,
        resetFocusStack,
        resetFocusStackToFocusItem,
        focusStack,
        currentFocusId,
      };
    },
    {
      wrapper: RecoilRoot,
    },
  );

  return { result };
};

describe('useFocusStack', () => {
  it('should push focus identifier to the stack', async () => {
    const { result } = renderHooks();

    expect(result.current.focusStack).toEqual([]);

    const focusItem = {
      focusId: 'test-focus-id',
      componentInstance: {
        componentType: FocusComponentType.MODAL,
        componentInstanceId: 'test-instance-id',
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: true,
        enableGlobalHotkeysConflictingWithKeyboard: true,
      },
    };

    await act(async () => {
      result.current.pushFocusItem({
        focusId: focusItem.focusId,
        component: {
          type: focusItem.componentInstance.componentType,
          instanceId: focusItem.componentInstance.componentInstanceId,
        },
        hotkeyScope: { scope: 'test-scope' },
        memoizeKey: 'global',
      });
    });

    expect(result.current.focusStack).toEqual([focusItem]);
    expect(result.current.currentFocusId).toEqual(focusItem.focusId);

    const anotherFocusItem = {
      focusId: 'another-focus-id',
      componentInstance: {
        componentType: FocusComponentType.MODAL,
        componentInstanceId: 'another-instance-id',
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: true,
        enableGlobalHotkeysConflictingWithKeyboard: true,
      },
    };

    await act(async () => {
      result.current.pushFocusItem({
        focusId: anotherFocusItem.focusId,
        component: {
          type: anotherFocusItem.componentInstance.componentType,
          instanceId:
            anotherFocusItem.componentInstance.componentInstanceId,
        },
        hotkeyScope: { scope: 'test-scope' },
        memoizeKey: 'global',
      });
    });

    expect(result.current.focusStack).toEqual([
      focusItem,
      anotherFocusItem,
    ]);
    expect(result.current.currentFocusId).toEqual(
      anotherFocusItem.focusId,
    );
  });

  it('should remove focus id from the stack', async () => {
    const { result } = renderHooks();

    const firstFocusItem = {
      focusId: 'first-focus-id',
      componentInstance: {
        componentType: FocusComponentType.MODAL,
        componentInstanceId: 'first-instance-id',
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: true,
        enableGlobalHotkeysConflictingWithKeyboard: true,
      },
    };

    const secondFocusItem = {
      focusId: 'second-focus-id',
      componentInstance: {
        componentType: FocusComponentType.MODAL,
        componentInstanceId: 'second-instance-id',
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: true,
        enableGlobalHotkeysConflictingWithKeyboard: true,
      },
    };

    await act(async () => {
      result.current.pushFocusItem({
        focusId: firstFocusItem.focusId,
        component: {
          type: firstFocusItem.componentInstance.componentType,
          instanceId:
            firstFocusItem.componentInstance.componentInstanceId,
        },
        hotkeyScope: { scope: 'test-scope' },
        memoizeKey: 'global',
      });
    });

    await act(async () => {
      result.current.pushFocusItem({
        focusId: secondFocusItem.focusId,
        component: {
          type: secondFocusItem.componentInstance.componentType,
          instanceId:
            secondFocusItem.componentInstance.componentInstanceId,
        },
        hotkeyScope: { scope: 'test-scope' },
        memoizeKey: 'global',
      });
    });

    expect(result.current.focusStack).toEqual([
      firstFocusItem,
      secondFocusItem,
    ]);
    expect(result.current.currentFocusId).toEqual(
      secondFocusItem.focusId,
    );

    await act(async () => {
      result.current.removeFocusId({
        focusId: firstFocusItem.focusId,
        memoizeKey: 'global',
      });
    });

    expect(result.current.focusStack).toEqual([secondFocusItem]);
    expect(result.current.currentFocusId).toEqual(
      secondFocusItem.focusId,
    );
  });

  it('should reset the focus stack', async () => {
    const { result } = renderHooks();

    const focusItem = {
      focusId: 'test-focus-id',
      componentInstance: {
        componentType: FocusComponentType.MODAL,
        componentInstanceId: 'test-instance-id',
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: true,
        enableGlobalHotkeysConflictingWithKeyboard: true,
      },
    };

    await act(async () => {
      result.current.pushFocusItem({
        focusId: focusItem.focusId,
        component: {
          type: focusItem.componentInstance.componentType,
          instanceId: focusItem.componentInstance.componentInstanceId,
        },
        hotkeyScope: { scope: 'test-scope' },
        memoizeKey: 'global',
      });
    });

    expect(result.current.focusStack).toEqual([focusItem]);
    expect(result.current.currentFocusId).toEqual(focusItem.focusId);
    await act(async () => {
      result.current.resetFocusStack();
    });

    expect(result.current.focusStack).toEqual([]);
    expect(result.current.currentFocusId).toEqual(undefined);
  });

  it('should reset the focus stack to a specific focus identifier', async () => {
    const { result } = renderHooks();

    const firstFocusItem = {
      focusId: 'first-focus-id',
      componentInstance: {
        componentType: FocusComponentType.MODAL,
        componentInstanceId: 'first-instance-id',
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: true,
        enableGlobalHotkeysConflictingWithKeyboard: true,
      },
    };

    const secondFocusItem = {
      focusId: 'second-focus-id',
      componentInstance: {
        componentType: FocusComponentType.MODAL,
        componentInstanceId: 'second-instance-id',
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: true,
        enableGlobalHotkeysConflictingWithKeyboard: true,
      },
    };

    await act(async () => {
      result.current.pushFocusItem({
        focusId: firstFocusItem.focusId,
        component: {
          type: firstFocusItem.componentInstance.componentType,
          instanceId:
            firstFocusItem.componentInstance.componentInstanceId,
        },
        hotkeyScope: { scope: 'test-scope' },
        memoizeKey: 'global',
      });
    });

    await act(async () => {
      result.current.pushFocusItem({
        focusId: secondFocusItem.focusId,
        component: {
          type: secondFocusItem.componentInstance.componentType,
          instanceId:
            secondFocusItem.componentInstance.componentInstanceId,
        },
        hotkeyScope: { scope: 'test-scope' },
        memoizeKey: 'global',
      });
    });

    expect(result.current.focusStack).toEqual([
      firstFocusItem,
      secondFocusItem,
    ]);
    expect(result.current.currentFocusId).toEqual(
      secondFocusItem.focusId,
    );

    const newFocusItem = {
      focusId: 'new-focus-id',
      componentInstance: {
        componentType: FocusComponentType.MODAL,
        componentInstanceId: 'new-instance-id',
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: true,
        enableGlobalHotkeysConflictingWithKeyboard: true,
      },
    };

    await act(async () => {
      result.current.resetFocusStackToFocusItem({
        focusStackItem: {
          focusId: newFocusItem.focusId,
          componentInstance: {
            componentType: newFocusItem.componentInstance.componentType,
            componentInstanceId:
              newFocusItem.componentInstance.componentInstanceId,
          },
          globalHotkeysConfig: newFocusItem.globalHotkeysConfig,
        },
        hotkeyScope: { scope: 'test-scope' },
        memoizeKey: 'global',
      });
    });

    expect(result.current.focusStack).toEqual([newFocusItem]);
    expect(result.current.currentFocusId).toEqual(newFocusItem.focusId);
  });
});
