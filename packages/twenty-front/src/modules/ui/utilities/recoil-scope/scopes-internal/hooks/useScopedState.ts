import { SerializableParam, Snapshot } from 'recoil';

import { FamilyScopeInjector } from '@/ui/utilities/recoil-scope/utils/getFamilyScopeInjector';
import { ScopeInjector } from '@/ui/utilities/recoil-scope/utils/getScopeInjector';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

export const useScopedState = (scopeId: string) => {
  const getScopedState = <StateType>(scopeInjector: ScopeInjector<StateType>) =>
    scopeInjector(scopeId);

  const getScopedFamilyState =
    <StateType, FamilyKey extends SerializableParam>(
      familyScopeInjector: FamilyScopeInjector<StateType, FamilyKey>,
    ) =>
    (familyKey: FamilyKey) =>
      familyScopeInjector(scopeId, familyKey);

  const getScopedSnapshotValue = <StateType>(
    snashot: Snapshot,
    scopeInjector: ScopeInjector<StateType>,
  ) => getSnapshotValue(snashot, scopeInjector(scopeId));

  const getScopedFamilySnapshotValue =
    <StateType, FamilyKey extends SerializableParam>(
      snashot: Snapshot,
      familyScopeInjector: FamilyScopeInjector<StateType, FamilyKey>,
    ) =>
    (familyKey: FamilyKey) =>
      getSnapshotValue(snashot, familyScopeInjector(scopeId, familyKey));

  return {
    scopeId,
    getScopedState,
    getScopedFamilyState,
    getScopedSnapshotValue,
    getScopedFamilySnapshotValue,
  };
};
