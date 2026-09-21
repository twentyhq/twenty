import { useAtom } from 'jotai';

import { useRoutedFlowStateScopeId } from '@/ui/utilities/state/contexts/RoutedFlowStateScopeContext';
import { type FamilyState } from '@/ui/utilities/state/jotai/types/FamilyState';

export const useAtomFamilyState = <ValueType, FamilyKey>(
  familyState: FamilyState<ValueType, FamilyKey>,
  familyKey: FamilyKey,
): [
  ValueType,
  (value: ValueType | ((prev: ValueType) => ValueType)) => void,
] => {
  const scopeId = useRoutedFlowStateScopeId();

  return useAtom(familyState.getAtom(familyKey, scopeId));
};
