import { useMemo } from 'react';

import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { type ComponentSelectorV2 } from '@/ui/utilities/state/jotai/types/ComponentSelectorV2';

export const useRecoilComponentSelectorCallbackStateV2 = <StateType>(
  componentSelector: ComponentSelectorV2<StateType>,
  instanceIdFromProps?: string,
): ReturnType<ComponentSelectorV2<StateType>['selectorFamily']> => {
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
