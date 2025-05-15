import { useRecoilCallback } from 'recoil';

import { clickOutsideListenerIsActivatedComponentState } from '@/ui/utilities/pointer-event/states/clickOutsideListenerIsActivatedComponentState';
import { clickOutsideListenerMouseDownHappenedComponentState } from '@/ui/utilities/pointer-event/states/clickOutsideListenerMouseDownHappenedComponentState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';

export const useClickOutsideListener = (instanceId: string) => {
  const clickOutsideListenerIsActivatedState =
    useRecoilComponentCallbackStateV2(
      clickOutsideListenerIsActivatedComponentState,
      instanceId,
    );

  const clickOutsideListenerMouseDownHappenedState =
    useRecoilComponentCallbackStateV2(
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
