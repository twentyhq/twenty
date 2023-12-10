import { RecoilState, SerializableParam, useRecoilState } from 'recoil';

import { ScopedFamilyStateKey } from '../scopes-internal/types/ScopedFamilyStateKey';

export const useRecoilScopedFamilyState = <
  StateType,
  FamilyKey extends SerializableParam,
>(
  recoilState: (
    scopedFamilyKey: ScopedFamilyStateKey<FamilyKey>,
  ) => RecoilState<StateType>,
  scopeId: string,
  familyKey?: FamilyKey,
) => {
  const familyState = useRecoilState<StateType>(
    recoilState({
      scopeId,
      familyKey: familyKey || ('' as FamilyKey),
    }),
  );

  if (!familyKey) {
    return [undefined, undefined];
  }

  return familyState;
};
