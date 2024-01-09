import { RecoilState, SerializableParam, useRecoilState } from 'recoil';

import { FamilyStateScopeMapKey } from '../scopes-internal/types/FamilyStateScopeMapKey';

export const useRecoilScopedFamilyState = <
  StateType,
  FamilyKey extends SerializableParam,
>(
  recoilState: (
    scopedFamilyKey: FamilyStateScopeMapKey<FamilyKey>,
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
