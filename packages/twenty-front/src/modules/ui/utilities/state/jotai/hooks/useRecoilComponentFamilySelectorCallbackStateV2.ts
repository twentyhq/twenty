import { useCallback } from 'react';

import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { type ComponentFamilySelectorV2 } from '@/ui/utilities/state/jotai/types/ComponentFamilySelectorV2';

export const useRecoilComponentFamilySelectorCallbackStateV2 = <
  StateType,
  FamilyKey,
>(
  componentFamilySelector: ComponentFamilySelectorV2<StateType, FamilyKey>,
  instanceIdFromProps?: string,
): ((
  familyKey: FamilyKey,
) => ReturnType<
  ComponentFamilySelectorV2<StateType, FamilyKey>['selectorFamily']
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

  return useCallback(
    (familyKey: FamilyKey) =>
      componentFamilySelector.selectorFamily({ instanceId, familyKey }),
    [componentFamilySelector, instanceId],
  );
};
