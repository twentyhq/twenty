import { type WritableAtom } from 'jotai';

import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';

type JotaiWritableAtom<ValueType> = WritableAtom<
  ValueType,
  [ValueType | ((prev: ValueType) => ValueType)],
  void
>;

export type ComponentState<ValueType> = {
  type: 'ComponentState';
  key: string;
  atomFamily: (key: ComponentStateKey) => JotaiWritableAtom<ValueType>;
};
