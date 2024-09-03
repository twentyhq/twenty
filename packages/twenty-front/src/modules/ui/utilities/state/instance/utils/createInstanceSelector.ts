import { selectorFamily } from 'recoil';

import { InstanceReadOnlySelector } from '@/ui/utilities/state/instance/types/InstanceReadOnlySelector';
import { InstanceSelector } from '@/ui/utilities/state/instance/types/InstanceSelector';
import { InstanceStateKey } from '@/ui/utilities/state/instance/types/InstanceStateKey';
import { SelectorGetter } from '@/ui/utilities/state/types/SelectorGetter';
import { SelectorSetter } from '@/ui/utilities/state/types/SelectorSetter';
import { isDefined } from 'twenty-ui';

export const createInstanceSelector = <ValueType>({
  key,
  get,
  set,
}: {
  key: string;
  get: SelectorGetter<ValueType, InstanceStateKey>;
  set?: SelectorSetter<ValueType, InstanceStateKey>;
}) => {
  if (isDefined(set)) {
    return {
      key,
      selectorFamily: selectorFamily<ValueType, InstanceStateKey>({
        key,
        get,
        set,
      }),
    } as InstanceSelector<ValueType>;
  } else {
    return {
      key,
      selectorFamily: selectorFamily<ValueType, InstanceStateKey>({
        key,
        get,
      }),
    } as InstanceReadOnlySelector<ValueType>;
  }
};
