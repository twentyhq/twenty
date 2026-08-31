import { type FamilyState } from '@/ui/utilities/state/jotai/types/FamilyState';

export const getRoutedFlowScopedFamilyStateAtom = <ValueType, FamilyKey>(
  familyState: FamilyState<ValueType, FamilyKey>,
  familyKey: FamilyKey,
  scopeId: string | null,
) =>
  familyState.scope === 'routed-flow' && scopeId !== null
    ? familyState.atomFamilyForRoutedFlow(familyKey, scopeId)
    : familyState.atomFamily(familyKey);
