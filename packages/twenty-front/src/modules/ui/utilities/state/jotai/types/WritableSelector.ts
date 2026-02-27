import { type WritableAtom } from 'jotai';

export type WritableSelector<ValueType> = {
  type: 'WritableSelector';
  key: string;
  atom: WritableAtom<
    ValueType,
    [ValueType | ((prev: ValueType) => ValueType)],
    void
  >;
};
