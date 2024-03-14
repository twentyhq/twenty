import { RecoilState, SerializableParam } from 'recoil';

import { ComponentFamilyStateKey } from '@/ui/utilities/state/component-state/types/ComponentFamilyStateKey';

export const extractComponentFamilyState = <
  StateType,
  FamilyKey extends SerializableParam,
>(
  componentfamilyState: (
    componentFamilyStateKey: ComponentFamilyStateKey<FamilyKey>,
  ) => RecoilState<StateType>,
  scopeId: string,
) => {
  return (familyKey: FamilyKey) =>
    componentfamilyState({
      scopeId,
      familyKey: familyKey || ('' as FamilyKey),
    });
};
