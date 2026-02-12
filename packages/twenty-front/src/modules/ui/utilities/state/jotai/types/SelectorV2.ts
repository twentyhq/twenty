import { type Atom } from 'jotai';

export type SelectorV2<ValueType> = {
  type: 'SelectorV2';
  key: string;
  atom: Atom<ValueType>;
};
