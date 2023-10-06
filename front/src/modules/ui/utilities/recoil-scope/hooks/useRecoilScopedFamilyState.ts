import { RecoilState, useRecoilState } from 'recoil';

type ScopedFamilyStateKey<FamilyKey> = {
  scopeId: string;
  familyKey: FamilyKey;
};

export const useRecoilScopedFamilyState = <StateType, FamilyKey>(
  recoilState: (
    scopedFamilyKey: ScopedFamilyStateKey<FamilyKey>,
  ) => RecoilState<StateType>,
  scopeId: string,
  familyKey: FamilyKey,
) => {
  return useRecoilState<StateType>(
    recoilState({
      scopeId,
      familyKey,
    }),
  );
};
