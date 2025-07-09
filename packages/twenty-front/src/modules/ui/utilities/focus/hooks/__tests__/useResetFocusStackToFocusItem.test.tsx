import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useResetFocusStackToFocusItem } from '@/ui/utilities/focus/hooks/useResetFocusStackToFocusItem';
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
      const { resetFocusStackToFocusItem } = useResetFocusStackToFocusItem();
      const focusStack = useRecoilValue(focusStackState);
      const currentFocusId = useRecoilValue(currentFocusIdSelector);

      return {
        pushFocusItemToFocusStack,
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

describe('useResetFocusStackToFocusItem', () => {
  it('should reset the focus stack to a specific focus item', async () => {
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
      result.current.resetFocusStackToFocusItem({
        focusStackItem: firstFocusItem,
      });
    });

    expect(result.current.focusStack).toEqual([firstFocusItem]);
    expect(result.current.currentFocusId).toEqual(firstFocusItem.focusId);
  });
});
