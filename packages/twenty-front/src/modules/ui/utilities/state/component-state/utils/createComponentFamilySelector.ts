/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { selectorFamily, SerializableParam } from 'recoil';

import { ComponentFamilyReadOnlySelector } from '@/ui/utilities/state/component-state/types/ComponentFamilyReadOnlySelector';
import { ComponentFamilySelector } from '@/ui/utilities/state/component-state/types/ComponentFamilySelector';
import { ComponentFamilyStateKey } from '@/ui/utilities/state/component-state/types/ComponentFamilyStateKey';
import { ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { SelectorGetter } from '@/ui/utilities/state/types/SelectorGetter';
import { SelectorSetter } from '@/ui/utilities/state/types/SelectorSetter';
import { isDefined } from 'twenty-shared/utils';

export function createComponentFamilySelector<
  ValueType,
  FamilyKey extends SerializableParam,
>(options: {
  key: string;
  get: SelectorGetter<ValueType, ComponentFamilyStateKey<FamilyKey>>;
  set?: never;
  componentInstanceContext: ComponentInstanceStateContext<any> | null;
}): ComponentFamilyReadOnlySelector<ValueType, FamilyKey>;

export function createComponentFamilySelector<
  ValueType,
  FamilyKey extends SerializableParam,
>(options: {
  key: string;
  get: SelectorGetter<ValueType, ComponentFamilyStateKey<FamilyKey>>;
  set: SelectorSetter<ValueType, ComponentFamilyStateKey<FamilyKey>>;
  componentInstanceContext: ComponentInstanceStateContext<any> | null;
}): ComponentFamilySelector<ValueType, FamilyKey>;

export function createComponentFamilySelector<
  ValueType,
  FamilyKey extends SerializableParam,
>({
  key,
  get,
  set,
  componentInstanceContext,
}: {
  key: string;
  get: SelectorGetter<ValueType, ComponentFamilyStateKey<FamilyKey>>;
  set?: SelectorSetter<ValueType, ComponentFamilyStateKey<FamilyKey>>;
  componentInstanceContext: ComponentInstanceStateContext<any> | null;
}):
  | ComponentFamilySelector<ValueType, FamilyKey>
  | ComponentFamilyReadOnlySelector<ValueType, FamilyKey> {
  if (isDefined(componentInstanceContext)) {
    globalComponentInstanceContextMap.set(key, componentInstanceContext);
  }

  if (isDefined(set)) {
    return {
      type: 'ComponentFamilySelector',
      key,
      selectorFamily: selectorFamily<
        ValueType,
        ComponentFamilyStateKey<FamilyKey>
      >({
        key,
        get,
        set,
      }),
    } satisfies ComponentFamilySelector<ValueType, FamilyKey>;
  } else {
    return {
      type: 'ComponentFamilyReadOnlySelector',
      key,
      selectorFamily: selectorFamily<
        ValueType,
        ComponentFamilyStateKey<FamilyKey>
      >({
        key,
        get,
      }),
    } satisfies ComponentFamilyReadOnlySelector<ValueType, FamilyKey>;
  }
}
