import { useAtomValue } from 'jotai';

import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { type ComponentFamilySelectorV2 } from '@/ui/utilities/state/jotai/types/ComponentFamilySelectorV2';

export const useRecoilComponentFamilySelectorValueV2 = <StateType, FamilyKey>(
  componentFamilySelector: ComponentFamilySelectorV2<StateType, FamilyKey>,
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

  return useAtomValue(
    componentFamilySelector.selectorFamily({ instanceId, familyKey }),
  );
};
