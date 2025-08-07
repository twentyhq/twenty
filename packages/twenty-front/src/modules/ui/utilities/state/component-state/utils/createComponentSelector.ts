/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { selectorFamily } from 'recoil';

import { ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { ComponentReadOnlySelector } from '@/ui/utilities/state/component-state/types/ComponentReadOnlySelector';
import { ComponentSelector } from '@/ui/utilities/state/component-state/types/ComponentSelector';
import { ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { SelectorGetter } from '@/ui/utilities/state/types/SelectorGetter';
import { SelectorSetter } from '@/ui/utilities/state/types/SelectorSetter';
import { isDefined } from 'twenty-shared/utils';

export function createComponentSelector<ValueType>(options: {
  key: string;
  get: SelectorGetter<ValueType, ComponentStateKey>;
  set?: never;
  componentInstanceContext: ComponentInstanceStateContext<any> | null;
}): ComponentReadOnlySelector<ValueType>;

export function createComponentSelector<ValueType>(options: {
  key: string;
  get: SelectorGetter<ValueType, ComponentStateKey>;
  set: SelectorSetter<ValueType, ComponentStateKey>;
  componentInstanceContext: ComponentInstanceStateContext<any> | null;
}): ComponentSelector<ValueType>;

export function createComponentSelector<ValueType>({
  key,
  get,
  set,
  componentInstanceContext,
}: {
  key: string;
  get: SelectorGetter<ValueType, ComponentStateKey>;
  set?: SelectorSetter<ValueType, ComponentStateKey>;
  componentInstanceContext: ComponentInstanceStateContext<any> | null;
}): ComponentSelector<ValueType> | ComponentReadOnlySelector<ValueType> {
  if (isDefined(componentInstanceContext)) {
    globalComponentInstanceContextMap.set(key, componentInstanceContext);
  }

  if (isDefined(set)) {
    return {
      type: 'ComponentSelector',
      key,
      selectorFamily: selectorFamily<ValueType, ComponentStateKey>({
        key,
        get,
        set,
      }),
    } satisfies ComponentSelector<ValueType>;
  } else {
    return {
      type: 'ComponentReadOnlySelector',
      key,
      selectorFamily: selectorFamily<ValueType, ComponentStateKey>({
        key,
        get,
      }),
    } satisfies ComponentReadOnlySelector<ValueType>;
  }
}
