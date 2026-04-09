import { type Atom } from 'jotai';

export type FamilySelector<ValueType, FamilyKey> = {
  type: 'FamilySelector';
  key: string;
  selectorFamily: (key: FamilyKey) => Atom<ValueType>;
};
