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
  atomFamilyForRoutedFlow: (
    key: FamilyKey,
    scopeId: string,
  ) => JotaiWritableAtom<ValueType>;
} & ((key: FamilyKey) => JotaiWritableAtom<ValueType>);
