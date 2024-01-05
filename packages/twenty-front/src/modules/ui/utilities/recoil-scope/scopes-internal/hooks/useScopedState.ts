import { SerializableParam, Snapshot } from 'recoil';

import { FamilyScopeInjector } from '@/ui/utilities/recoil-scope/utils/getFamilyScopeInjector';
import { ScopeInjector } from '@/ui/utilities/recoil-scope/utils/getScopeInjector';
import { SelectorScopeInjector } from '@/ui/utilities/recoil-scope/utils/getSelectorScopeInjector';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

export const useScopedState = (scopeId: string) => {
  const getScopedState = <StateType>(scopeInjector: ScopeInjector<StateType>) =>
    scopeInjector(scopeId);

  const getScopedSelector = <StateType>(
    scopeInjector: SelectorScopeInjector<StateType>,
  ) => scopeInjector(scopeId);

  const getScopedFamilyState =
    <StateType, FamilyKey extends SerializableParam>(
      familyScopeInjector: FamilyScopeInjector<StateType, FamilyKey>,
    ) =>
    (familyKey: FamilyKey) =>
      familyScopeInjector(scopeId, familyKey);

  const getScopedSnapshotValue = <StateType>(
    snapshot: Snapshot,
    scopeInjector: ScopeInjector<StateType>,
  ) => getSnapshotValue(snapshot, scopeInjector(scopeId));

  const getScopedSelectorSnapshotValue = <StateType>(
    snapshot: Snapshot,
    scopeInjector: SelectorScopeInjector<StateType>,
  ) => getSnapshotValue(snapshot, scopeInjector(scopeId));

  const getScopedFamilySnapshotValue =
    <StateType, FamilyKey extends SerializableParam>(
      snapshot: Snapshot,
      familyScopeInjector: FamilyScopeInjector<StateType, FamilyKey>,
    ) =>
    (familyKey: FamilyKey) =>
      getSnapshotValue(snapshot, familyScopeInjector(scopeId, familyKey));

  return {
    scopeId,
    getScopedState,
    getScopedSelector,
    getScopedFamilyState,
    getScopedSnapshotValue,
    getScopedSelectorSnapshotValue,
    getScopedFamilySnapshotValue,
  };
};
