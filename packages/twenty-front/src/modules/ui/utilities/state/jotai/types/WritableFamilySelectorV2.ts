import { type WritableAtom } from 'jotai';

export type WritableFamilySelectorV2<ValueType, FamilyKey> = {
  type: 'WritableFamilySelectorV2';
  key: string;
  selectorFamily: (
    key: FamilyKey,
  ) => WritableAtom<
    ValueType,
    [ValueType | ((prev: ValueType) => ValueType)],
    void
  >;
};
