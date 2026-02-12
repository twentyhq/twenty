import { type WritableAtom } from 'jotai';

type JotaiWritableAtom<ValueType> = WritableAtom<
  ValueType,
  [ValueType | ((prev: ValueType) => ValueType)],
  void
>;

// A Jotai-backed atom family — the V2 equivalent of Recoil's `atomFamily`.
// Created via `createFamilyStateV2`.
export type FamilyStateV2<ValueType, FamilyKey> = {
  type: 'FamilyStateV2';
  key: string;
  atomFamily: (key: FamilyKey) => JotaiWritableAtom<ValueType>;
};
