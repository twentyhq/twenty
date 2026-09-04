import { useMemo } from 'react';

import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useComponentStateSurfaceId } from '@/ui/utilities/state/component-state/hooks/useComponentStateSurfaceId';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { type ComponentState } from '@/ui/utilities/state/jotai/types/ComponentState';

export const useAtomComponentStateCallbackState = <StateType>(
  componentState: ComponentState<StateType>,
  instanceIdFromProps?: string,
): ReturnType<ComponentState<StateType>['atomFamily']> => {
  const componentInstanceContext = globalComponentInstanceContextMap.get(
    componentState.key,
  );

  if (!componentInstanceContext) {
    throw new Error(
      `Instance context for key "${componentState.key}" is not defined`,
    );
  }

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    componentInstanceContext,
    instanceIdFromProps,
  );

  const surfaceId = useComponentStateSurfaceId();

  return useMemo(
    () => componentState.atomFamily({ instanceId, surfaceId }),
    [componentState, instanceId, surfaceId],
  );
};
