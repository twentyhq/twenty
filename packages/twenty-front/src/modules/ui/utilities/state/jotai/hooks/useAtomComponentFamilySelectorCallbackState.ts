import { useCallback } from 'react';

import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
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
      // oxlint-disable-next-line lingui/no-unlocalized-strings -- This missing component state is a developer invariant diagnostic.
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
