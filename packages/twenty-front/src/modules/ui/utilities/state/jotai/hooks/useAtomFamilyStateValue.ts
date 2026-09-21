import { useAtomValue } from 'jotai';

import { useRoutedFlowStateScopeId } from '@/ui/utilities/state/contexts/RoutedFlowStateScopeContext';
import { type FamilyState } from '@/ui/utilities/state/jotai/types/FamilyState';

export const useAtomFamilyStateValue = <ValueType, FamilyKey>(
  familyState: FamilyState<ValueType, FamilyKey>,
  familyKey: FamilyKey,
): ValueType => {
  const scopeId = useRoutedFlowStateScopeId();

  return useAtomValue(familyState.getAtom(familyKey, scopeId));
};
