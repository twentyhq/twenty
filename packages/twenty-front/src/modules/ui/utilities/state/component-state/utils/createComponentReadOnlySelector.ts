import { selectorFamily } from 'recoil';

import { ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { SelectorGetter } from '@/ui/utilities/state/types/SelectorGetter';

export const createComponentReadOnlySelector = <ValueType>({
  key,
  get,
}: {
  key: string;
  get: SelectorGetter<ValueType, ComponentStateKey>;
}) => {
  return selectorFamily<ValueType, ComponentStateKey>({
    key,
    get,
  });
};
