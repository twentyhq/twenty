import { useAtomValue } from 'jotai';

import { type FamilyStateV2 } from '@/ui/utilities/state/jotai/types/FamilyStateV2';

// V2 (Jotai-backed) equivalent of `useRecoilValue(atomFamily(key))`.
// Subscribes to a specific member of a `FamilyStateV2<T, K>`.
export const useFamilyRecoilValueV2 = <ValueType, FamilyKey>(
  familyState: FamilyStateV2<ValueType, FamilyKey>,
  familyKey: FamilyKey,
): ValueType => {
  return useAtomValue(familyState.atomFamily(familyKey));
};
