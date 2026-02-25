import { type WritableAtom } from 'jotai';

import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';

type JotaiWritableAtom<ValueType> = WritableAtom<
  ValueType,
  [ValueType | ((prev: ValueType) => ValueType)],
  void
>;

export type ComponentFamilyStateKey<FamilyKey> = ComponentStateKey & {
  familyKey: FamilyKey;
};

export type ComponentFamilyState<ValueType, FamilyKey> = {
  type: 'ComponentFamilyState';
  key: string;
  atomFamily: (
    key: ComponentFamilyStateKey<FamilyKey>,
  ) => JotaiWritableAtom<ValueType>;
};
