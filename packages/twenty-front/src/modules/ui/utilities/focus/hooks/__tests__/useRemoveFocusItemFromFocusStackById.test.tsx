import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdSelector';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { RecoilRoot, useRecoilValue } from 'recoil';

const renderHooks = () => {
  const { result } = renderHook(
    () => {
      const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
      const { removeFocusItemFromFocusStackById } =
        useRemoveFocusItemFromFocusStackById();
      const focusStack = useRecoilValue(focusStackState);
      const currentFocusId = useRecoilValue(currentFocusIdSelector);

      return {
        pushFocusItemToFocusStack,
        removeFocusItemFromFocusStackById,
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
    componentType: FocusComponentType.DROPDOWN,
    componentInstanceId: 'second-instance-id',
  },
  globalHotkeysConfig: {
    enableGlobalHotkeysWithModifiers: true,
    enableGlobalHotkeysConflictingWithKeyboard: true,
  },
};

describe('useRemoveFocusItemFromFocusStackById', () => {
  it('should remove focus item from the stack', async () => {
    const { result } = renderHooks();

    await act(async () => {
      result.current.pushFocusItemToFocusStack({
        focusId: firstFocusItem.focusId,
        component: {
          type: firstFocusItem.componentInstance.componentType,
          instanceId: firstFocusItem.componentInstance.componentInstanceId,
        },
      });
    });

    await act(async () => {
      result.current.pushFocusItemToFocusStack({
        focusId: secondFocusItem.focusId,
        component: {
          type: secondFocusItem.componentInstance.componentType,
          instanceId: secondFocusItem.componentInstance.componentInstanceId,
        },
      });
    });

    expect(result.current.focusStack).toEqual([
      firstFocusItem,
      secondFocusItem,
    ]);
    expect(result.current.currentFocusId).toEqual(secondFocusItem.focusId);

    await act(async () => {
      result.current.removeFocusItemFromFocusStackById({
        focusId: firstFocusItem.focusId,
      });
    });

    expect(result.current.focusStack).toEqual([secondFocusItem]);
    expect(result.current.currentFocusId).toEqual(secondFocusItem.focusId);
  });

  it('should handle invalid focusId gracefully without errors', async () => {
    const { result } = renderHooks();

    await act(async () => {
      result.current.pushFocusItemToFocusStack({
        focusId: firstFocusItem.focusId,
        component: {
          type: firstFocusItem.componentInstance.componentType,
          instanceId: firstFocusItem.componentInstance.componentInstanceId,
        },
      });
    });

    await act(async () => {
      result.current.pushFocusItemToFocusStack({
        focusId: secondFocusItem.focusId,
        component: {
          type: secondFocusItem.componentInstance.componentType,
          instanceId: secondFocusItem.componentInstance.componentInstanceId,
        },
      });
    });

    const originalFocusStack = result.current.focusStack;
    const originalCurrentFocusId = result.current.currentFocusId;

    await act(async () => {
      expect(() => {
        result.current.removeFocusItemFromFocusStackById({
          focusId: 'invalid-focus-id',
        });
      }).not.toThrow();
    });

    expect(result.current.focusStack).toEqual(originalFocusStack);
    expect(result.current.currentFocusId).toEqual(originalCurrentFocusId);
    expect(result.current.focusStack).toEqual([
      firstFocusItem,
      secondFocusItem,
    ]);
    expect(result.current.currentFocusId).toEqual(secondFocusItem.focusId);
  });
});
