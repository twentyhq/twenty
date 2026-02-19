import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useResetFocusStackToFocusItem } from '@/ui/utilities/focus/hooks/useResetFocusStackToFocusItem';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdSelector';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { act } from 'react';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const renderHooks = () => {
  const { result } = renderHook(
    () => {
      const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
      const { resetFocusStackToFocusItem } = useResetFocusStackToFocusItem();
      const focusStack = useRecoilValueV2(focusStackState);
      const currentFocusId = useRecoilValueV2(currentFocusIdSelector);

      return {
        pushFocusItemToFocusStack,
        resetFocusStackToFocusItem,
        focusStack,
        currentFocusId,
      };
    },
    {
      wrapper: Wrapper,
    },
  );

  return { result };
};

describe('useResetFocusStackToFocusItem', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

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
