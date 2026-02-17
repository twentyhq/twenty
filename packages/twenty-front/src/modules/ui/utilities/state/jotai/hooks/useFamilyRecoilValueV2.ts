import { useAtomValue } from 'jotai';

import { type FamilyStateV2 } from '@/ui/utilities/state/jotai/types/FamilyStateV2';

export const useFamilyRecoilValueV2 = <ValueType, FamilyKey>(
  familyState: FamilyStateV2<ValueType, FamilyKey>,
  familyKey: FamilyKey,
): ValueType => {
  return useAtomValue(familyState.atomFamily(familyKey));
};
