/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { selectorFamily, type SerializableParam } from 'recoil';

import { type ComponentFamilyReadOnlySelector } from '@/ui/utilities/state/component-state/types/ComponentFamilyReadOnlySelector';
import { type ComponentFamilySelector } from '@/ui/utilities/state/component-state/types/ComponentFamilySelector';
import { type ComponentFamilyStateKey } from '@/ui/utilities/state/component-state/types/ComponentFamilyStateKey';
import { type ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { type SelectorGetter } from '@/ui/utilities/state/types/SelectorGetter';
import { type SelectorSetter } from '@/ui/utilities/state/types/SelectorSetter';
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
