import { type Atom } from 'jotai';

export type FamilySelectorV2<ValueType, FamilyKey> = {
  type: 'FamilySelectorV2';
  key: string;
  selectorFamily: (key: FamilyKey) => Atom<ValueType>;
};
