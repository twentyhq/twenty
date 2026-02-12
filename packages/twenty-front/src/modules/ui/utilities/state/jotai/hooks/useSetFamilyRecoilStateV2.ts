import { useSetAtom } from 'jotai';

import { type FamilyStateV2 } from '@/ui/utilities/state/jotai/types/FamilyStateV2';

// V2 (Jotai-backed) equivalent of `useSetRecoilState(atomFamily(key))`.
// Returns a setter for a specific member of a `FamilyStateV2<T, K>`.
export const useSetFamilyRecoilStateV2 = <ValueType, FamilyKey>(
  familyState: FamilyStateV2<ValueType, FamilyKey>,
  familyKey: FamilyKey,
): ((value: ValueType | ((prev: ValueType) => ValueType)) => void) => {
  return useSetAtom(familyState.atomFamily(familyKey));
};
