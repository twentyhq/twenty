import { selectorFamily } from 'recoil';

import { RecoilComponentStateKey } from '@/ui/utilities/state/component-state/types/RecoilComponentStateKey';
import { SelectorGetter } from '@/ui/utilities/state/types/SelectorGetter';

export const createComponentReadOnlySelector = <ValueType>({
  key,
  get,
}: {
  key: string;
  get: SelectorGetter<ValueType, RecoilComponentStateKey>;
}) => {
  return selectorFamily<ValueType, RecoilComponentStateKey>({
    key,
    get,
  });
};
