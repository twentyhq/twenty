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
  atomForRoutedFlow: (
    scopeId: string,
  ) => WritableAtom<
    ValueType,
    [ValueType | ((prev: ValueType) => ValueType)],
    void
  >;
};
