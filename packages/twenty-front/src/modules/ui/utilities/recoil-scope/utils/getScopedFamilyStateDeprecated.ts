import { RecoilState, SerializableParam } from 'recoil';

import { FamilyStateScopeMapKey } from '../scopes-internal/types/FamilyStateScopeMapKey';

export const getScopedFamilyStateDeprecated = <
  StateType,
  FamilyKey extends SerializableParam,
>(
  recoilState: (
    scopedFamilyKey: FamilyStateScopeMapKey<FamilyKey>,
  ) => RecoilState<StateType>,
  scopeId: string,
  familyKey: FamilyKey,
) => {
  return recoilState({
    scopeId,
    familyKey: familyKey || ('' as FamilyKey),
  });
};
