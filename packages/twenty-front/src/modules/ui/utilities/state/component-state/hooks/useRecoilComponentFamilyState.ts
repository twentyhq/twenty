import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { ComponentFamilySelector } from '@/ui/utilities/state/component-state/types/ComponentFamilySelector';
import { ComponentFamilyState } from '@/ui/utilities/state/component-state/types/ComponentFamilyState';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { SerializableParam, useRecoilState } from 'recoil';

export const useRecoilComponentFamilyState = <
  StateType,
  FamilyKey extends SerializableParam,
>(
  componentState:
    | ComponentFamilyState<StateType, FamilyKey>
    | ComponentFamilySelector<StateType, FamilyKey>,
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

  const familySelector =
    componentState.type === 'ComponentFamilyState'
      ? componentState.atomFamily({ instanceId, familyKey })
      : componentState.selectorFamily({ instanceId, familyKey });

  return useRecoilState(familySelector);
};
