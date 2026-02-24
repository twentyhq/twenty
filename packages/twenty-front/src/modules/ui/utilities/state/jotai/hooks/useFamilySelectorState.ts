import { useAtom } from 'jotai';

import { type WritableFamilySelectorV2 } from '@/ui/utilities/state/jotai/types/WritableFamilySelectorV2';

export const useFamilySelectorState = <ValueType, FamilyKey>(
  familySelector: WritableFamilySelectorV2<ValueType, FamilyKey>,
  familyKey: FamilyKey,
): [
  ValueType,
  (value: ValueType | ((prev: ValueType) => ValueType)) => void,
] => {
  return useAtom(familySelector.selectorFamily(familyKey));
};
