import { useSetAtom } from 'jotai';

import { type FamilyStateV2 } from '@/ui/utilities/state/jotai/types/FamilyStateV2';

export const useSetFamilyRecoilStateV2 = <ValueType, FamilyKey>(
  familyState: FamilyStateV2<ValueType, FamilyKey>,
  familyKey: FamilyKey,
): ((value: ValueType | ((prev: ValueType) => ValueType)) => void) => {
  return useSetAtom(familyState.atomFamily(familyKey));
};
