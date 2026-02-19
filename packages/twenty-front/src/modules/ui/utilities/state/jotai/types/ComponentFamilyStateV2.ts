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

export type ComponentFamilyStateV2<ValueType, FamilyKey> = {
  type: 'ComponentFamilyStateV2';
  key: string;
  atomFamily: (
    key: ComponentFamilyStateKey<FamilyKey>,
  ) => JotaiWritableAtom<ValueType>;
};
