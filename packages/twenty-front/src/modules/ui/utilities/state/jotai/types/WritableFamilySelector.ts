import { type WritableAtom } from 'jotai';

export type WritableFamilySelector<ValueType, FamilyKey> = {
  type: 'WritableFamilySelector';
  key: string;
  selectorFamily: (
    key: FamilyKey,
  ) => WritableAtom<
    ValueType,
    [ValueType | ((prev: ValueType) => ValueType)],
    void
  >;
};
