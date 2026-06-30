import { useCallback } from 'react';

import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { type ComponentFamilyState } from '@/ui/utilities/state/jotai/types/ComponentFamilyState';

export const useAtomComponentFamilyStateCallbackState = <StateType, FamilyKey>(
  componentFamilyState: ComponentFamilyState<StateType, FamilyKey>,
  instanceIdFromProps?: string,
): ((
  familyKey: FamilyKey,
) => ReturnType<ComponentFamilyState<StateType, FamilyKey>['atomFamily']>) => {
  const componentInstanceContext = globalComponentInstanceContextMap.get(
    componentFamilyState.key,
  );

  if (!componentInstanceContext) {
    throw new Error(
      `Instance context for key "${componentFamilyState.key}" is not defined`,
    );
  }

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    componentInstanceContext,
    instanceIdFromProps,
  );

  return useCallback(
    (familyKey: FamilyKey) =>
      componentFamilyState.atomFamily({ instanceId, familyKey }),
    [componentFamilyState, instanceId],
  );
};
