import { RecoilState, SerializableParam, useSetRecoilState } from 'recoil';

import { FamilyStateScopeMapKey } from '../scopes-internal/types/FamilyStateScopeMapKey';

export const useSetRecoilScopedFamilyState = <
  StateType,
  FamilyKey extends SerializableParam,
>(
  recoilState: (
    scopedFamilyKey: FamilyStateScopeMapKey<FamilyKey>,
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
