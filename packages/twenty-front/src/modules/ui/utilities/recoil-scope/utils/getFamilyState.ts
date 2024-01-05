import { RecoilState, SerializableParam } from 'recoil';

import { FamilyStateScopeMapKey } from '../scopes-internal/types/FamilyStateScopeMapKey';

export const getFamilyState = <StateType, FamilyKey extends SerializableParam>(
  familyStateScopeMap: (
    scopedFamilyKey: FamilyStateScopeMapKey<FamilyKey>,
  ) => RecoilState<StateType>,
  scopeId: string,
) => {
  return (familyKey: FamilyKey) =>
    familyStateScopeMap({
      scopeId,
      familyKey: familyKey || ('' as FamilyKey),
    });
};
