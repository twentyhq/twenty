import { useFocusStack } from '@/ui/utilities/focus/hooks/useFocusStack';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdentifierSelector';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { RecoilRoot, useRecoilValue } from 'recoil';

const renderHooks = () => {
  const { result } = renderHook(
    () => {
      const {
        pushFocusIdentifier,
        removeFocusId,
        resetFocusStack,
        resetFocusStackToFocusIdentifier,
      } = useFocusStack();

      const focusStack = useRecoilValue(focusStackState);
      const currentFocusId = useRecoilValue(currentFocusIdSelector);

      return {
        pushFocusIdentifier,
        removeFocusId,
        resetFocusStack,
        resetFocusStackToFocusIdentifier,
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

    const focusIdentifier = {
      focusId: 'test-focus-id',
      componentInstance: {
        componentType: FocusComponentType.MODAL,
        componentInstanceId: 'test-instance-id',
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: true,
        enableConflictingWithKeyboardGlobalHotkeys: true,
      },
    };

    await act(async () => {
      result.current.pushFocusIdentifier({
        focusId: focusIdentifier.focusId,
        component: {
          type: focusIdentifier.componentInstance.componentType,
          instanceId: focusIdentifier.componentInstance.componentInstanceId,
        },
        hotkeyScope: { scope: 'test-scope' },
        memoizeKey: 'global',
      });
    });

    expect(result.current.focusStack).toEqual([focusIdentifier]);
    expect(result.current.currentFocusId).toEqual(focusIdentifier.focusId);

    const anotherFocusIdentifier = {
      focusId: 'another-focus-id',
      componentInstance: {
        componentType: FocusComponentType.MODAL,
        componentInstanceId: 'another-instance-id',
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: true,
        enableConflictingWithKeyboardGlobalHotkeys: true,
      },
    };

    await act(async () => {
      result.current.pushFocusIdentifier({
        focusId: anotherFocusIdentifier.focusId,
        component: {
          type: anotherFocusIdentifier.componentInstance.componentType,
          instanceId:
            anotherFocusIdentifier.componentInstance.componentInstanceId,
        },
        hotkeyScope: { scope: 'test-scope' },
        memoizeKey: 'global',
      });
    });

    expect(result.current.focusStack).toEqual([
      focusIdentifier,
      anotherFocusIdentifier,
    ]);
    expect(result.current.currentFocusId).toEqual(
      anotherFocusIdentifier.focusId,
    );
  });

  it('should remove focus id from the stack', async () => {
    const { result } = renderHooks();

    const firstFocusIdentifier = {
      focusId: 'first-focus-id',
      componentInstance: {
        componentType: FocusComponentType.MODAL,
        componentInstanceId: 'first-instance-id',
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: true,
        enableConflictingWithKeyboardGlobalHotkeys: true,
      },
    };

    const secondFocusIdentifier = {
      focusId: 'second-focus-id',
      componentInstance: {
        componentType: FocusComponentType.MODAL,
        componentInstanceId: 'second-instance-id',
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: true,
        enableConflictingWithKeyboardGlobalHotkeys: true,
      },
    };

    await act(async () => {
      result.current.pushFocusIdentifier({
        focusId: firstFocusIdentifier.focusId,
        component: {
          type: firstFocusIdentifier.componentInstance.componentType,
          instanceId:
            firstFocusIdentifier.componentInstance.componentInstanceId,
        },
        hotkeyScope: { scope: 'test-scope' },
        memoizeKey: 'global',
      });
    });

    await act(async () => {
      result.current.pushFocusIdentifier({
        focusId: secondFocusIdentifier.focusId,
        component: {
          type: secondFocusIdentifier.componentInstance.componentType,
          instanceId:
            secondFocusIdentifier.componentInstance.componentInstanceId,
        },
        hotkeyScope: { scope: 'test-scope' },
        memoizeKey: 'global',
      });
    });

    expect(result.current.focusStack).toEqual([
      firstFocusIdentifier,
      secondFocusIdentifier,
    ]);
    expect(result.current.currentFocusId).toEqual(
      secondFocusIdentifier.focusId,
    );

    await act(async () => {
      result.current.removeFocusId({
        focusId: firstFocusIdentifier.focusId,
        memoizeKey: 'global',
      });
    });

    expect(result.current.focusStack).toEqual([secondFocusIdentifier]);
    expect(result.current.currentFocusId).toEqual(
      secondFocusIdentifier.focusId,
    );
  });

  it('should reset the focus stack', async () => {
    const { result } = renderHooks();

    const focusIdentifier = {
      focusId: 'test-focus-id',
      componentInstance: {
        componentType: FocusComponentType.MODAL,
        componentInstanceId: 'test-instance-id',
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: true,
        enableConflictingWithKeyboardGlobalHotkeys: true,
      },
    };

    await act(async () => {
      result.current.pushFocusIdentifier({
        focusId: focusIdentifier.focusId,
        component: {
          type: focusIdentifier.componentInstance.componentType,
          instanceId: focusIdentifier.componentInstance.componentInstanceId,
        },
        hotkeyScope: { scope: 'test-scope' },
        memoizeKey: 'global',
      });
    });

    expect(result.current.focusStack).toEqual([focusIdentifier]);
    expect(result.current.currentFocusId).toEqual(focusIdentifier.focusId);
    await act(async () => {
      result.current.resetFocusStack();
    });

    expect(result.current.focusStack).toEqual([]);
    expect(result.current.currentFocusId).toEqual(undefined);
  });

  it('should reset the focus stack to a specific focus identifier', async () => {
    const { result } = renderHooks();

    const firstFocusIdentifier = {
      focusId: 'first-focus-id',
      componentInstance: {
        componentType: FocusComponentType.MODAL,
        componentInstanceId: 'first-instance-id',
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: true,
        enableConflictingWithKeyboardGlobalHotkeys: true,
      },
    };

    const secondFocusIdentifier = {
      focusId: 'second-focus-id',
      componentInstance: {
        componentType: FocusComponentType.MODAL,
        componentInstanceId: 'second-instance-id',
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: true,
        enableConflictingWithKeyboardGlobalHotkeys: true,
      },
    };

    await act(async () => {
      result.current.pushFocusIdentifier({
        focusId: firstFocusIdentifier.focusId,
        component: {
          type: firstFocusIdentifier.componentInstance.componentType,
          instanceId:
            firstFocusIdentifier.componentInstance.componentInstanceId,
        },
        hotkeyScope: { scope: 'test-scope' },
        memoizeKey: 'global',
      });
    });

    await act(async () => {
      result.current.pushFocusIdentifier({
        focusId: secondFocusIdentifier.focusId,
        component: {
          type: secondFocusIdentifier.componentInstance.componentType,
          instanceId:
            secondFocusIdentifier.componentInstance.componentInstanceId,
        },
        hotkeyScope: { scope: 'test-scope' },
        memoizeKey: 'global',
      });
    });

    expect(result.current.focusStack).toEqual([
      firstFocusIdentifier,
      secondFocusIdentifier,
    ]);
    expect(result.current.currentFocusId).toEqual(
      secondFocusIdentifier.focusId,
    );

    const newFocusIdentifier = {
      focusId: 'new-focus-id',
      componentInstance: {
        componentType: FocusComponentType.MODAL,
        componentInstanceId: 'new-instance-id',
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: true,
        enableConflictingWithKeyboardGlobalHotkeys: true,
      },
    };

    await act(async () => {
      result.current.resetFocusStackToFocusIdentifier({
        focusStackItem: {
          focusId: newFocusIdentifier.focusId,
          componentInstance: {
            componentType: newFocusIdentifier.componentInstance.componentType,
            componentInstanceId:
              newFocusIdentifier.componentInstance.componentInstanceId,
          },
          globalHotkeysConfig: newFocusIdentifier.globalHotkeysConfig,
        },
        hotkeyScope: { scope: 'test-scope' },
        memoizeKey: 'global',
      });
    });

    expect(result.current.focusStack).toEqual([newFocusIdentifier]);
    expect(result.current.currentFocusId).toEqual(newFocusIdentifier.focusId);
  });
});
