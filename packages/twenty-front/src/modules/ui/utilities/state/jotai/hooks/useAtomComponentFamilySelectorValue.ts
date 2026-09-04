import { useAtomValue } from 'jotai';

import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useComponentStateSurfaceId } from '@/ui/utilities/state/component-state/hooks/useComponentStateSurfaceId';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { type ComponentFamilySelector } from '@/ui/utilities/state/jotai/types/ComponentFamilySelector';

export const useAtomComponentFamilySelectorValue = <StateType, FamilyKey>(
  componentFamilySelector: ComponentFamilySelector<StateType, FamilyKey>,
  familyKey: FamilyKey,
  instanceIdFromProps?: string,
): StateType => {
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

  return useAtomValue(
    componentFamilySelector.selectorFamily({
      instanceId,
      surfaceId,
      familyKey,
    }),
  );
};
