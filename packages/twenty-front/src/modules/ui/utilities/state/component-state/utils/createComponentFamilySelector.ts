import { selectorFamily, SerializableParam } from 'recoil';

import { ComponentFamilyStateKey } from '@/ui/utilities/state/component-state/types/ComponentFamilyStateKey';
import { SelectorGetter } from '@/ui/utilities/state/types/SelectorGetter';
import { SelectorSetter } from '@/ui/utilities/state/types/SelectorSetter';

export const createComponentFamilySelector = <
  ValueType,
  FamilyKey extends SerializableParam,
>({
  key,
  get,
  set,
}: {
  key: string;
  get: SelectorGetter<ValueType, ComponentFamilyStateKey<FamilyKey>>;
  set: SelectorSetter<ValueType, ComponentFamilyStateKey<FamilyKey>>;
}) => {
  return selectorFamily<ValueType, ComponentFamilyStateKey<FamilyKey>>({
    key,
    get,
    set,
  });
};
