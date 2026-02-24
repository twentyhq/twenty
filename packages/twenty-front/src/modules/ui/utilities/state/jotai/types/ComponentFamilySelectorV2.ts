import { type Atom } from 'jotai';

import { type ComponentFamilyStateKey } from '@/ui/utilities/state/jotai/types/ComponentFamilyStateV2';

export type ComponentFamilySelectorV2<ValueType, FamilyKey> = {
  type: 'ComponentFamilySelectorV2';
  key: string;
  selectorFamily: (key: ComponentFamilyStateKey<FamilyKey>) => Atom<ValueType>;
};
