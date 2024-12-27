import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { ComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/types/ComponentFamilyStateV2';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { SerializableParam, useRecoilState } from 'recoil';

export const useRecoilComponentFamilyStateV2 = <
  StateType,
  FamilyKey extends SerializableParam,
>(
  componentState: ComponentFamilyStateV2<StateType, FamilyKey>,
  familyKey: FamilyKey,
  instanceIdFromProps?: string,
) => {
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

  return useRecoilState(componentState.atomFamily({ instanceId, familyKey }));
};
