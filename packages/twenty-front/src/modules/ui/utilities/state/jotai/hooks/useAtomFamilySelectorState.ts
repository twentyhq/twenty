import { useAtom } from 'jotai';

import { type WritableFamilySelector } from '@/ui/utilities/state/jotai/types/WritableFamilySelector';

export const useAtomFamilySelectorState = <ValueType, FamilyKey>(
  familySelector: WritableFamilySelector<ValueType, FamilyKey>,
  familyKey: FamilyKey,
): [
  ValueType,
  (value: ValueType | ((prev: ValueType) => ValueType)) => void,
] => {
  return useAtom(familySelector.selectorFamily(familyKey));
};
