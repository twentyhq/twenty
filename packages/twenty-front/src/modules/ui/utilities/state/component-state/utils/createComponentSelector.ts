import { selectorFamily } from 'recoil';

import { ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { SelectorGetter } from '@/ui/utilities/state/types/SelectorGetter';
import { SelectorSetter } from '@/ui/utilities/state/types/SelectorSetter';

export const createComponentSelector = <ValueType>({
  key,
  get,
  set,
}: {
  key: string;
  get: SelectorGetter<ValueType, ComponentStateKey>;
  set: SelectorSetter<ValueType, ComponentStateKey>;
}) => {
  return selectorFamily<ValueType, ComponentStateKey>({
    key,
    get,
    set,
  });
};
