import { RecoilState, SerializableParam } from 'recoil';

import { FamilyStateScopeMapKey } from '../scopes-internal/types/FamilyStateScopeMapKey';

export type FamilyScopeInjector<
  StateType,
  FamilyKey extends SerializableParam,
> = (scopeId: string, familyKey: FamilyKey) => RecoilState<StateType>;

export const getFamilyScopeInjector = <
  StateType,
  FamilyKey extends SerializableParam,
>(
  scopedFamilyState: (
    scopedFamilyKey: FamilyStateScopeMapKey<FamilyKey>,
  ) => RecoilState<StateType>,
) => {
  return (scopeId: string, familyKey: FamilyKey) =>
    scopedFamilyState({
      scopeId,
      familyKey: familyKey || ('' as FamilyKey),
    });
};
