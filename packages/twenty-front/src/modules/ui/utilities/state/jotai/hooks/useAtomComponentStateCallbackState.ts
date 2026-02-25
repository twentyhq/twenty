import { useMemo } from 'react';

import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { type ComponentStateV2 } from '@/ui/utilities/state/jotai/types/ComponentStateV2';

export const useAtomComponentStateCallbackState = <StateType>(
  componentState: ComponentStateV2<StateType>,
  instanceIdFromProps?: string,
): ReturnType<ComponentStateV2<StateType>['atomFamily']> => {
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

  return useMemo(
    () => componentState.atomFamily({ instanceId }),
    [componentState, instanceId],
  );
};
