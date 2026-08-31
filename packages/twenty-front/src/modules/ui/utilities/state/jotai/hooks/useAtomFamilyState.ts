import { useAtom } from 'jotai';

import { useRoutedFlowStateScopeId } from '@/ui/utilities/state/hooks/useRoutedFlowStateScopeId';
import { type FamilyState } from '@/ui/utilities/state/jotai/types/FamilyState';
import { getRoutedFlowScopedFamilyStateAtom } from '@/ui/utilities/state/jotai/utils/getRoutedFlowScopedFamilyStateAtom';

export const useAtomFamilyState = <ValueType, FamilyKey>(
  familyState: FamilyState<ValueType, FamilyKey>,
  familyKey: FamilyKey,
): [
  ValueType,
  (value: ValueType | ((prev: ValueType) => ValueType)) => void,
] => {
  const scopeId = useRoutedFlowStateScopeId();

  return useAtom(
    getRoutedFlowScopedFamilyStateAtom(familyState, familyKey, scopeId),
  );
};
