import { type Atom } from 'jotai';

import { type ComponentFamilyStateKey } from '@/ui/utilities/state/jotai/types/ComponentFamilyState';

export type ComponentFamilySelector<ValueType, FamilyKey> = {
  type: 'ComponentFamilySelector';
  key: string;
  selectorFamily: (key: ComponentFamilyStateKey<FamilyKey>) => Atom<ValueType>;
};
