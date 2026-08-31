import { useSetAtom } from 'jotai';

import { useRoutedFlowStateScopeId } from '@/ui/utilities/state/hooks/useRoutedFlowStateScopeId';
import { type FamilyState } from '@/ui/utilities/state/jotai/types/FamilyState';
import { getRoutedFlowScopedFamilyStateAtom } from '@/ui/utilities/state/jotai/utils/getRoutedFlowScopedFamilyStateAtom';

export const useSetAtomFamilyState = <ValueType, FamilyKey>(
  familyState: FamilyState<ValueType, FamilyKey>,
  familyKey: FamilyKey,
): ((value: ValueType | ((prev: ValueType) => ValueType)) => void) => {
  const scopeId = useRoutedFlowStateScopeId();

  return useSetAtom(
    getRoutedFlowScopedFamilyStateAtom(familyState, familyKey, scopeId),
  );
};
