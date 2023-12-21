import { RecoilState, SerializableParam } from 'recoil';

import { ScopedFamilyStateKey } from '../scopes-internal/types/ScopedFamilyStateKey';

export type FamilyScopeInjector<
  StateType,
  FamilyKey extends SerializableParam,
> = (scopeId: string, familyKey: FamilyKey) => RecoilState<StateType>;

export const getFamilyScopeInjector = <
  StateType,
  FamilyKey extends SerializableParam,
>(
  scopedFamilyState: (
    scopedFamilyKey: ScopedFamilyStateKey<FamilyKey>,
  ) => RecoilState<StateType>,
) => {
  return (scopeId: string, familyKey: FamilyKey) =>
    scopedFamilyState({
      scopeId,
      familyKey: familyKey || ('' as FamilyKey),
    });
};
