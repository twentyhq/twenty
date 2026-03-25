import { type Atom } from 'jotai';

import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';

export type ComponentSelector<ValueType> = {
  type: 'ComponentSelector';
  key: string;
  selectorFamily: (key: ComponentStateKey) => Atom<ValueType>;
};
