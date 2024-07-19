import { AtomEffect, atomFamily, SerializableParam } from 'recoil';

import { ScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/types/ScopeInternalContext';
import { ComponentFamilyStateKey } from '@/ui/utilities/state/component-state/types/ComponentFamilyStateKey';
import { isDefined } from 'twenty-ui';

type CreateComponentFamilyStateV2Type<ValueType> = {
  key: string;
  defaultValue: ValueType;
  componentContext: ScopeInternalContext<any> | null;
  effects?: AtomEffect<ValueType>[];
};

export const createComponentFamilyStateV2 = <
  ValueType,
  FamilyKey extends SerializableParam,
>({
  key,
  effects,
  defaultValue,
  componentContext,
}: CreateComponentFamilyStateV2Type<ValueType>) => {
  if (isDefined(componentContext)) {
    if (!isDefined((window as any).componentContextStateMap)) {
      (window as any).componentContextStateMap = new Map();
    }

    (window as any).componentContextStateMap.set(key, componentContext);
  }

  return {
    key,
    atomFamily: atomFamily<ValueType, ComponentFamilyStateKey<FamilyKey>>({
      key,
      default: defaultValue,
      effects,
    }),
  };
};
