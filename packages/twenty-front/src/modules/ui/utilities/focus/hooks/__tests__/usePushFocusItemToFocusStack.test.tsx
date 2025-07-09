import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
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
      const focusStack = useRecoilValue(focusStackState);
      const currentFocusId = useRecoilValue(currentFocusIdSelector);

      return {
        pushFocusItemToFocusStack,
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

describe('usePushFocusItemToFocusStack', () => {
  it('should push focus item to the stack', async () => {
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
      result.current.pushFocusItemToFocusStack({
        focusId: focusItem.focusId,
        component: {
          type: focusItem.componentInstance.componentType,
          instanceId: focusItem.componentInstance.componentInstanceId,
        },
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
      result.current.pushFocusItemToFocusStack({
        focusId: anotherFocusItem.focusId,
        component: {
          type: anotherFocusItem.componentInstance.componentType,
          instanceId: anotherFocusItem.componentInstance.componentInstanceId,
        },
      });
    });

    expect(result.current.focusStack).toEqual([focusItem, anotherFocusItem]);
    expect(result.current.currentFocusId).toEqual(anotherFocusItem.focusId);
  });
});
