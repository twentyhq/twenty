import { useAtomValue } from 'jotai';

import { type FamilyState } from '@/ui/utilities/state/jotai/types/FamilyState';

export const useAtomFamilyStateValue = <ValueType, FamilyKey>(
  familyState: FamilyState<ValueType, FamilyKey>,
  familyKey: FamilyKey,
): ValueType => {
  return useAtomValue(familyState.atomFamily(familyKey));
};
