import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useResetFocusStack } from '@/ui/utilities/focus/hooks/useResetFocusStack';
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
      const { resetFocusStack } = useResetFocusStack();
      const focusStack = useRecoilValueV2(focusStackState);
      const currentFocusId = useRecoilValueV2(currentFocusIdSelector);

      return {
        pushFocusItemToFocusStack,
        resetFocusStack,
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

describe('useResetFocusStack', () => {
  beforeEach(() => {
    resetJotaiStore();
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

    await act(async () => {
      result.current.resetFocusStack();
    });

    expect(result.current.focusStack).toEqual([]);
    expect(result.current.currentFocusId).toEqual(undefined);
  });
});
