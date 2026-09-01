import { type WritableAtom } from 'jotai';

export type State<ValueType> = {
  type: 'State';
  key: string;
  scope?: 'routed-flow';
  atom: WritableAtom<
    ValueType,
    [ValueType | ((prev: ValueType) => ValueType)],
    void
  >;
  getAtom: (
    scopeId: string | null,
  ) => WritableAtom<
    ValueType,
    [ValueType | ((prev: ValueType) => ValueType)],
    void
  >;
};
