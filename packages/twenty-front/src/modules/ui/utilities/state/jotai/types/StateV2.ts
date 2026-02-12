import { type WritableAtom } from 'jotai';

// A Jotai-backed state — the V2 equivalent of Recoil's `RecoilState<T>`.
// Created via `createStateV2`.
export type StateV2<ValueType> = {
  type: 'StateV2';
  key: string;
  atom: WritableAtom<
    ValueType,
    [ValueType | ((prev: ValueType) => ValueType)],
    void
  >;
};
