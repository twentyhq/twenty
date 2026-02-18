import { type WritableAtom } from 'jotai';

export type WritableSelectorV2<ValueType> = {
  type: 'WritableSelectorV2';
  key: string;
  atom: WritableAtom<
    ValueType,
    [ValueType | ((prev: ValueType) => ValueType)],
    void
  >;
};
