import { useSetAtom } from 'jotai';

import { type FamilyState } from '@/ui/utilities/state/jotai/types/FamilyState';

export const useSetAtomFamilyState = <ValueType, FamilyKey>(
  familyState: FamilyState<ValueType, FamilyKey>,
  familyKey: FamilyKey,
): ((value: ValueType | ((prev: ValueType) => ValueType)) => void) => {
  return useSetAtom(familyState.atomFamily(familyKey));
};
