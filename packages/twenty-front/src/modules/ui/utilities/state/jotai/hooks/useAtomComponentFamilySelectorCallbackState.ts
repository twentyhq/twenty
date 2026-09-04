import { useCallback } from 'react';

import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useComponentStateSurfaceId } from '@/ui/utilities/state/component-state/hooks/useComponentStateSurfaceId';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { type ComponentFamilySelector } from '@/ui/utilities/state/jotai/types/ComponentFamilySelector';

export const useAtomComponentFamilySelectorCallbackState = <
  StateType,
  FamilyKey,
>(
  componentFamilySelector: ComponentFamilySelector<StateType, FamilyKey>,
  instanceIdFromProps?: string,
): ((
  familyKey: FamilyKey,
) => ReturnType<
  ComponentFamilySelector<StateType, FamilyKey>['selectorFamily']
>) => {
  const componentInstanceContext = globalComponentInstanceContextMap.get(
    componentFamilySelector.key,
  );

  if (!componentInstanceContext) {
    throw new Error(
      `Instance context for key "${componentFamilySelector.key}" is not defined`,
    );
  }

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    componentInstanceContext,
    instanceIdFromProps,
  );

  const surfaceId = useComponentStateSurfaceId();

  return useCallback(
    (familyKey: FamilyKey) =>
      componentFamilySelector.selectorFamily({
        instanceId,
        surfaceId,
        familyKey,
      }),
    [componentFamilySelector, instanceId, surfaceId],
  );
};
