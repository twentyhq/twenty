import { useAtomValue } from 'jotai';

import { type FamilySelectorV2 } from '@/ui/utilities/state/jotai/types/FamilySelectorV2';
import { type WritableFamilySelectorV2 } from '@/ui/utilities/state/jotai/types/WritableFamilySelectorV2';

export const useFamilySelectorValueV2 = <ValueType, FamilyKey>(
  familySelector:
    | FamilySelectorV2<ValueType, FamilyKey>
    | WritableFamilySelectorV2<ValueType, FamilyKey>,
  familyKey: FamilyKey,
): ValueType => {
  return useAtomValue(familySelector.selectorFamily(familyKey));
};
