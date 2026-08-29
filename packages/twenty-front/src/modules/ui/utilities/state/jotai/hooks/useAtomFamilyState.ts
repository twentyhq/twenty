import { useAtom } from 'jotai';

import { type FamilyState } from '@/ui/utilities/state/jotai/types/FamilyState';

export const useAtomFamilyState = <ValueType, FamilyKey>(
  familyState: FamilyState<ValueType, FamilyKey>,
  familyKey: FamilyKey,
): [
  ValueType,
  (value: ValueType | ((prev: ValueType) => ValueType)) => void,
] => {
  return useAtom(familyState.atomFamily(familyKey));
};
