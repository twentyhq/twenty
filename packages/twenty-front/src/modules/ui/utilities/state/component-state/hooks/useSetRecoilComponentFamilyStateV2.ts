/* eslint-disable react-hooks/rules-of-hooks */

// We're disabling rules-of-hooks because we're sure that the call order cannot be modified
//   because a component state cannot change its type during its lifecycle

import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { ComponentFamilySelectorV2 } from '@/ui/utilities/state/component-state/types/ComponentFamilySelectorV2';
import { ComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/types/ComponentFamilyStateV2';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { SerializableParam, SetterOrUpdater, useSetRecoilState } from 'recoil';

export const useSetRecoilComponentFamilyStateV2 = <
  StateType,
  FamilyKey extends SerializableParam,
>(
  componentState:
    | ComponentFamilyStateV2<StateType, FamilyKey>
    | ComponentFamilySelectorV2<StateType, FamilyKey>,
  familyKey: FamilyKey,
  instanceIdFromProps?: string,
): SetterOrUpdater<StateType> => {
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

  switch (componentState.type) {
    case 'ComponentFamilyState': {
      return useSetRecoilState(
        componentState.atomFamily({ familyKey, instanceId }),
      );
    }
    case 'ComponentFamilySelector': {
      return useSetRecoilState(
        componentState.selectorFamily({
          familyKey,
          instanceId,
        }),
      );
    }
  }
};
