import { useRecoilCallback } from 'recoil';

import { clickOutsideListenerIsActivatedComponentState } from '@/ui/utilities/pointer-event/states/clickOutsideListenerIsActivatedComponentState';
import { clickOutsideListenerMouseDownHappenedComponentState } from '@/ui/utilities/pointer-event/states/clickOutsideListenerMouseDownHappenedComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';

export const useClickOutsideListener = (instanceId: string) => {
  const clickOutsideListenerIsActivatedState = useRecoilComponentCallbackState(
    clickOutsideListenerIsActivatedComponentState,
    instanceId,
  );

  const clickOutsideListenerMouseDownHappenedState =
    useRecoilComponentCallbackState(
      clickOutsideListenerMouseDownHappenedComponentState,
      instanceId,
    );

  const toggleClickOutside = useRecoilCallback(
    ({ set }) =>
      (activated: boolean) => {
        set(clickOutsideListenerIsActivatedState, activated);

        if (!activated) {
          set(clickOutsideListenerMouseDownHappenedState, false);
        }
      },
    [
      clickOutsideListenerIsActivatedState,
      clickOutsideListenerMouseDownHappenedState,
    ],
  );

  return {
    toggleClickOutside,
  };
};
