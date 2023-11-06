import { RecoilState, SerializableParam } from 'recoil';

import { ScopedFamilyStateKey } from '../scopes-internal/types/ScopedFamilyStateKey';

export const getScopedFamilyState = <
  StateType,
  FamilyKey extends SerializableParam,
>(
  recoilState: (
    scopedFamilyKey: ScopedFamilyStateKey<FamilyKey>,
  ) => RecoilState<StateType>,
  scopeId: string,
  familyKey: FamilyKey,
) => {
  return recoilState({
    scopeId,
    familyKey: familyKey || ('' as FamilyKey),
  });
};
