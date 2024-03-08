import { selectorFamily } from 'recoil';

import { StateScopeMapKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/StateScopeMapKey';
import { SelectorGetter } from '@/ui/utilities/state/types/SelectorGetter';
import { SelectorSetter } from '@/ui/utilities/state/types/SelectorSetter';

export const createComponentSelector = <ValueType>({
  key,
  get,
  set,
}: {
  key: string;
  get: SelectorGetter<ValueType, StateScopeMapKey>;
  set: SelectorSetter<ValueType, StateScopeMapKey>;
}) => {
  return selectorFamily<ValueType, StateScopeMapKey>({
    key,
    get,
    set,
  });
};
