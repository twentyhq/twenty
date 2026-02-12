import { type WritableAtom } from 'jotai';

export type StateV2<ValueType> = {
  type: 'StateV2';
  key: string;
  atom: WritableAtom<
    ValueType,
    [ValueType | ((prev: ValueType) => ValueType)],
    void
  >;
};
