import { useCallback } from 'react';

import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { type ComponentFamilyStateV2 } from '@/ui/utilities/state/jotai/types/ComponentFamilyStateV2';

export const useRecoilComponentFamilyStateCallbackStateV2 = <
  StateType,
  FamilyKey,
>(
  componentFamilyState: ComponentFamilyStateV2<StateType, FamilyKey>,
  instanceIdFromProps?: string,
): ((
  familyKey: FamilyKey,
) => ReturnType<
  ComponentFamilyStateV2<StateType, FamilyKey>['atomFamily']
>) => {
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
