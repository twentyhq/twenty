import { useAtomValue } from 'jotai';

import { type FamilySelector } from '@/ui/utilities/state/jotai/types/FamilySelector';
import { type WritableFamilySelector } from '@/ui/utilities/state/jotai/types/WritableFamilySelector';

export const useAtomFamilySelectorValue = <ValueType, FamilyKey>(
  familySelector:
    | FamilySelector<ValueType, FamilyKey>
    | WritableFamilySelector<ValueType, FamilyKey>,
  familyKey: FamilyKey,
): ValueType => {
  return useAtomValue(familySelector.selectorFamily(familyKey));
};
