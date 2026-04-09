import { useAtom } from 'jotai';

import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { type ComponentFamilyState } from '@/ui/utilities/state/jotai/types/ComponentFamilyState';

export const useAtomComponentFamilyState = <StateType, FamilyKey>(
  componentState: ComponentFamilyState<StateType, FamilyKey>,
  familyKey: FamilyKey,
  instanceIdFromProps?: string,
): [
  StateType,
  (value: StateType | ((prev: StateType) => StateType)) => void,
] => {
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

  return useAtom(componentState.atomFamily({ instanceId, familyKey }));
};
