import { useCallback } from 'react';

import { clickOutsideListenerIsActivatedComponentState } from '@/ui/utilities/pointer-event/states/clickOutsideListenerIsActivatedComponentState';
import { clickOutsideListenerMouseDownHappenedComponentState } from '@/ui/utilities/pointer-event/states/clickOutsideListenerMouseDownHappenedComponentState';
import { useStore } from 'jotai';
import { useComponentStateSurfaceId } from '@/ui/utilities/state/component-state/hooks/useComponentStateSurfaceId';

export const useClickOutsideListener = (instanceId: string) => {
  const surfaceId = useComponentStateSurfaceId();
  const store = useStore();

  const toggleClickOutside = useCallback(
    (activated: boolean) => {
      store.set(
        clickOutsideListenerIsActivatedComponentState.atomFamily({
          instanceId,
          surfaceId,
        }),
        activated,
      );

      if (!activated) {
        store.set(
          clickOutsideListenerMouseDownHappenedComponentState.atomFamily({
            instanceId,
            surfaceId,
          }),
          false,
        );
      }
    },
    [instanceId, store, surfaceId],
  );

  return {
    toggleClickOutside,
  };
};
