import { useMemo } from 'react';

import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { type ComponentSelector } from '@/ui/utilities/state/jotai/types/ComponentSelector';

export const useAtomComponentSelectorCallbackState = <StateType>(
  componentSelector: ComponentSelector<StateType>,
  instanceIdFromProps?: string,
): ReturnType<ComponentSelector<StateType>['selectorFamily']> => {
  const componentInstanceContext = globalComponentInstanceContextMap.get(
    componentSelector.key,
  );

  if (!componentInstanceContext) {
    throw new Error(
      `Instance context for key "${componentSelector.key}" is not defined`,
    );
  }

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    componentInstanceContext,
    instanceIdFromProps,
  );

  return useMemo(
    () => componentSelector.selectorFamily({ instanceId }),
    [componentSelector, instanceId],
  );
};
