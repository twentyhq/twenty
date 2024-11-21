/* eslint-disable no-redeclare */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { selectorFamily, SerializableParam } from 'recoil';

import { ComponentFamilyReadOnlySelectorV2 } from '@/ui/utilities/state/component-state/types/ComponentFamilyReadOnlySelectorV2';
import { ComponentFamilySelectorV2 } from '@/ui/utilities/state/component-state/types/ComponentFamilySelectorV2';
import { ComponentFamilyStateKeyV2 } from '@/ui/utilities/state/component-state/types/ComponentFamilyStateKeyV2';
import { ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { SelectorGetter } from '@/ui/utilities/state/types/SelectorGetter';
import { SelectorSetter } from '@/ui/utilities/state/types/SelectorSetter';
import { isDefined } from 'twenty-ui';

export function createComponentFamilySelectorV2<
  ValueType,
  FamilyKey extends SerializableParam,
>(options: {
  key: string;
  get: SelectorGetter<ValueType, ComponentFamilyStateKeyV2<FamilyKey>>;
  componentInstanceContext: ComponentInstanceStateContext<any> | null;
}): ComponentFamilyReadOnlySelectorV2<ValueType, FamilyKey>;

export function createComponentFamilySelectorV2<
  ValueType,
  FamilyKey extends SerializableParam,
>(options: {
  key: string;
  get: SelectorGetter<ValueType, ComponentFamilyStateKeyV2<FamilyKey>>;
  set: SelectorSetter<ValueType, ComponentFamilyStateKeyV2<FamilyKey>>;
  componentInstanceContext: ComponentInstanceStateContext<any> | null;
}): ComponentFamilySelectorV2<ValueType, FamilyKey>;

export function createComponentFamilySelectorV2<
  ValueType,
  FamilyKey extends SerializableParam,
>({
  key,
  get,
  set,
  componentInstanceContext,
}: {
  key: string;
  get: SelectorGetter<ValueType, ComponentFamilyStateKeyV2<FamilyKey>>;
  set?: SelectorSetter<ValueType, ComponentFamilyStateKeyV2<FamilyKey>>;
  componentInstanceContext: ComponentInstanceStateContext<any> | null;
}):
  | ComponentFamilySelectorV2<ValueType, FamilyKey>
  | ComponentFamilyReadOnlySelectorV2<ValueType, FamilyKey> {
  if (isDefined(componentInstanceContext)) {
    globalComponentInstanceContextMap.set(key, componentInstanceContext);
  }

  if (isDefined(set)) {
    return {
      type: 'ComponentFamilySelector',
      key,
      selectorFamily: selectorFamily<
        ValueType,
        ComponentFamilyStateKeyV2<FamilyKey>
      >({
        key,
        get,
        set,
      }),
    } satisfies ComponentFamilySelectorV2<ValueType, FamilyKey>;
  } else {
    return {
      type: 'ComponentFamilyReadOnlySelector',
      key,
      selectorFamily: selectorFamily<
        ValueType,
        ComponentFamilyStateKeyV2<FamilyKey>
      >({
        key,
        get,
      }),
    } satisfies ComponentFamilyReadOnlySelectorV2<ValueType, FamilyKey>;
  }
}
