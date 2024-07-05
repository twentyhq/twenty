import { AtomEffect, atomFamily } from 'recoil';

import { ScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/types/ScopeInternalContext';
import { ComponentState } from '@/ui/utilities/state/component-state/types/ComponentState';
import { ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { isDefined } from '~/utils/isDefined';

type CreateComponentStateV2Type<ValueType> = {
  key: string;
  defaultValue: ValueType;
  componentContext?: ScopeInternalContext<any> | null;
  effects?: AtomEffect<ValueType>[];
};

export const createComponentStateV2 = <ValueType>({
  key,
  defaultValue,
  componentContext,
  effects,
}: CreateComponentStateV2Type<ValueType>): ComponentState<ValueType> => {
  if (isDefined(componentContext)) {
    if (!isDefined((window as any).componentContextStateMap)) {
      (window as any).componentContextStateMap = new Map();
    }

    (window as any).componentContextStateMap.set(key, componentContext);
  }

  return {
    key,
    atomFamily: atomFamily<ValueType, ComponentStateKey>({
      key,
      default: defaultValue,
      effects: effects,
    }),
  };
};
