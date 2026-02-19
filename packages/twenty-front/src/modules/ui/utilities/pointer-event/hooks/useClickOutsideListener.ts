import { useCallback } from 'react';

import { clickOutsideListenerIsActivatedComponentState } from '@/ui/utilities/pointer-event/states/clickOutsideListenerIsActivatedComponentState';
import { clickOutsideListenerMouseDownHappenedComponentState } from '@/ui/utilities/pointer-event/states/clickOutsideListenerMouseDownHappenedComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

export const useClickOutsideListener = (instanceId: string) => {
  const toggleClickOutside = useCallback(
    (activated: boolean) => {
      jotaiStore.set(
        clickOutsideListenerIsActivatedComponentState.atomFamily({
          instanceId,
        }),
        activated,
      );

      if (!activated) {
        jotaiStore.set(
          clickOutsideListenerMouseDownHappenedComponentState.atomFamily({
            instanceId,
          }),
          false,
        );
      }
    },
    [instanceId],
  );

  return {
    toggleClickOutside,
  };
};
