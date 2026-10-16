import { useAtomValue } from 'jotai';

import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { type ComponentFamilyState } from '@/ui/utilities/state/jotai/types/ComponentFamilyState';

export const useAtomComponentFamilyStateValue = <StateType, FamilyKey>(
  componentState: ComponentFamilyState<StateType, FamilyKey>,
  familyKey: FamilyKey,
  instanceIdFromProps?: string,
): StateType => {
  const componentInstanceContext = globalComponentInstanceContextMap.get(
    componentState.key,
  );

  if (!componentInstanceContext) {
    throw new Error(
      // oxlint-disable-next-line lingui/no-unlocalized-strings -- This missing component state is a developer invariant diagnostic.
      `Instance context for key "${componentState.key}" is not defined`,
    );
  }

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    componentInstanceContext,
    instanceIdFromProps,
  );

  return useAtomValue(componentState.atomFamily({ instanceId, familyKey }));
};
