import { type WritableAtom } from 'jotai';

type JotaiWritableAtom<ValueType> = WritableAtom<
  ValueType,
  [ValueType | ((prev: ValueType) => ValueType)],
  void
>;

export type FamilyState<ValueType, FamilyKey> = {
  type: 'FamilyState';
  key: string;
  scope?: 'routed-flow';
  atomFamily: (key: FamilyKey) => JotaiWritableAtom<ValueType>;
  getAtom: (
    key: FamilyKey,
    scopeId: string | null,
  ) => JotaiWritableAtom<ValueType>;
} & ((key: FamilyKey) => JotaiWritableAtom<ValueType>);
