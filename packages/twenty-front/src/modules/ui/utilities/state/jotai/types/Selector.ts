import { type Atom } from 'jotai';

export type Selector<ValueType> = {
  type: 'Selector';
  key: string;
  atom: Atom<ValueType>;
};
