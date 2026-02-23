import { type Atom } from 'jotai';

import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';

export type ComponentSelectorV2<ValueType> = {
  type: 'ComponentSelectorV2';
  key: string;
  selectorFamily: (key: ComponentStateKey) => Atom<ValueType>;
};
