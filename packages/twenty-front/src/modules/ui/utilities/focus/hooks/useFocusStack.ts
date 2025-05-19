import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { FocusIdentifier } from '@/ui/utilities/focus/types/FocusIdentifier';
import { useRecoilCallback } from 'recoil';

export const useFocusStack = () => {
  const pushFocusIdentifier = useRecoilCallback(
    ({ set }) =>
      (
        focusId: string,
        component: {
          type: FocusComponentType;
          instanceId: string;
        },
      ) => {
        const focusKey: FocusIdentifier = {
          focusId,
          componentType: component.type,
          componentInstanceId: component.instanceId,
        };

        set(focusStackState, (previousFocusStack) => [
          ...previousFocusStack,
          focusKey,
        ]);
      },
    [],
  );

  const removeFocusId = useRecoilCallback(
    ({ set }) =>
      (focusId: string) => {
        set(focusStackState, (previousFocusStack) =>
          previousFocusStack.filter((focusKey) => focusKey.focusId !== focusId),
        );
      },
    [],
  );

  const resetFocusStack = useRecoilCallback(
    ({ reset }) =>
      () => {
        reset(focusStackState);
      },
    [],
  );

  const resetFocusStackToFocusIdentifier = useRecoilCallback(
    ({ set }) =>
      (focusIdentifier: FocusIdentifier) => {
        set(focusStackState, [focusIdentifier]);
      },
    [],
  );

  return {
    pushFocusIdentifier,
    removeFocusId,
    resetFocusStack,
    resetFocusStackToFocusIdentifier,
  };
};
