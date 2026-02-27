import { type WritableAtom } from 'jotai';

export type State<ValueType> = {
  type: 'State';
  key: string;
  atom: WritableAtom<
    ValueType,
    [ValueType | ((prev: ValueType) => ValueType)],
    void
  >;
};
