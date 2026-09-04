import { useSetAtom } from 'jotai';

import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useComponentStateSurfaceId } from '@/ui/utilities/state/component-state/hooks/useComponentStateSurfaceId';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { type ComponentFamilyState } from '@/ui/utilities/state/jotai/types/ComponentFamilyState';

export const useSetAtomComponentFamilyState = <ValueType, FamilyKey>(
  componentState: ComponentFamilyState<ValueType, FamilyKey>,
  familyKey: FamilyKey,
  instanceIdFromProps?: string,
): ((value: ValueType | ((prev: ValueType) => ValueType)) => void) => {
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

  return useSetAtom(
    componentState.atomFamily({ instanceId, surfaceId, familyKey }),
  );
};
