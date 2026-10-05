import { useSetAtom } from 'jotai';

import { useRoutedFlowStateScopeId } from '@/ui/utilities/state/contexts/RoutedFlowStateScopeContext';
import { type FamilyState } from '@/ui/utilities/state/jotai/types/FamilyState';

export const useSetAtomFamilyState = <ValueType, FamilyKey>(
  familyState: FamilyState<ValueType, FamilyKey>,
  familyKey: FamilyKey,
): ((value: ValueType | ((prev: ValueType) => ValueType)) => void) => {
  const scopeId = useRoutedFlowStateScopeId();

  return useSetAtom(familyState.getAtom(familyKey, scopeId));
};
