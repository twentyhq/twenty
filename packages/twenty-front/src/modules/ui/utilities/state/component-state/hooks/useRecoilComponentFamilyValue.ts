/* eslint-disable react-hooks/rules-of-hooks */
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { type ComponentFamilyReadOnlySelector } from '@/ui/utilities/state/component-state/types/ComponentFamilyReadOnlySelector';
import { type ComponentFamilySelector } from '@/ui/utilities/state/component-state/types/ComponentFamilySelector';
import { type ComponentFamilyState } from '@/ui/utilities/state/component-state/types/ComponentFamilyState';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { type SerializableParam, useRecoilValue } from 'recoil';

export const useRecoilComponentFamilyValue = <
  StateType,
  FamilyKey extends SerializableParam,
>(
  componentState:
    | ComponentFamilyState<StateType, FamilyKey>
    | ComponentFamilySelector<StateType, FamilyKey>
    | ComponentFamilyReadOnlySelector<StateType, FamilyKey>,
  familyKey: FamilyKey,
  instanceIdFromProps?: string,
): StateType => {
  const instanceContext = globalComponentInstanceContextMap.get(
    componentState.key,
  );

  if (!instanceContext) {
    throw new Error(
      `Instance context for key "${componentState.key}" is not defined`,
    );
  }

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    instanceContext,
    instanceIdFromProps,
  );

  switch (componentState.type) {
    case 'ComponentFamilyState': {
      return useRecoilValue(
        componentState.atomFamily({ familyKey, instanceId }),
      );
    }
    case 'ComponentFamilySelector': {
      return useRecoilValue(
        componentState.selectorFamily({ familyKey, instanceId }),
      );
    }
    case 'ComponentFamilyReadOnlySelector': {
      return useRecoilValue(
        componentState.selectorFamily({ familyKey, instanceId }),
      );
    }
  }
};
