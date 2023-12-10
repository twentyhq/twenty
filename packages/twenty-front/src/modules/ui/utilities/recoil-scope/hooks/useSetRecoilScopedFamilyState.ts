import { RecoilState, SerializableParam, useSetRecoilState } from 'recoil';

import { ScopedFamilyStateKey } from '../scopes-internal/types/ScopedFamilyStateKey';

export const useSetRecoilScopedFamilyState = <
  StateType,
  FamilyKey extends SerializableParam,
>(
  recoilState: (
    scopedFamilyKey: ScopedFamilyStateKey<FamilyKey>,
  ) => RecoilState<StateType>,
  scopeId: string,
  familyKey?: FamilyKey,
) => {
  const familyState = useSetRecoilState<StateType>(
    recoilState({
      scopeId,
      familyKey: familyKey || ('' as FamilyKey),
    }),
  );

  if (!familyKey) {
    return;
  }

  return familyState;
};
