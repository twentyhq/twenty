import { useSetAtom } from 'jotai';

import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { type ComponentFamilyStateV2 } from '@/ui/utilities/state/jotai/types/ComponentFamilyStateV2';

export const useSetRecoilComponentFamilyStateV2 = <ValueType, FamilyKey>(
  componentState: ComponentFamilyStateV2<ValueType, FamilyKey>,
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

  return useSetAtom(componentState.atomFamily({ instanceId, familyKey }));
};
