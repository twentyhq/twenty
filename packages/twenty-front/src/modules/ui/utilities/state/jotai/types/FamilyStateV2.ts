import { type WritableAtom } from 'jotai';

type JotaiWritableAtom<ValueType> = WritableAtom<
  ValueType,
  [ValueType | ((prev: ValueType) => ValueType)],
  void
>;

export type FamilyStateV2<ValueType, FamilyKey> = {
  type: 'FamilyStateV2';
  key: string;
  atomFamily: (key: FamilyKey) => JotaiWritableAtom<ValueType>;
};
