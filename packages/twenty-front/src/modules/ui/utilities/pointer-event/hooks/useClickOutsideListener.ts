import { useCallback } from 'react';

import { clickOutsideListenerIsActivatedComponentState } from '@/ui/utilities/pointer-event/states/clickOutsideListenerIsActivatedComponentState';
import { clickOutsideListenerMouseDownHappenedComponentState } from '@/ui/utilities/pointer-event/states/clickOutsideListenerMouseDownHappenedComponentState';
import { useStore } from 'jotai';

export const useClickOutsideListener = (instanceId: string) => {
  const store = useStore();

  const toggleClickOutside = useCallback(
    (activated: boolean) => {
      store.set(
        clickOutsideListenerIsActivatedComponentState.atomFamily({
          instanceId,
        }),
        activated,
      );

      if (!activated) {
        store.set(
          clickOutsideListenerMouseDownHappenedComponentState.atomFamily({
            instanceId,
          }),
          false,
        );
      }
    },
    [instanceId, store],
  );

  return {
    toggleClickOutside,
  };
};
