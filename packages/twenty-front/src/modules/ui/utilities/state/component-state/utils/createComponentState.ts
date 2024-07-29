import { AtomEffect, atomFamily } from 'recoil';

import { ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';

type CreateComponentStateType<ValueType> = {
  key: string;
  defaultValue: ValueType;
  effects?: AtomEffect<ValueType>[];
};

export const createComponentState = <ValueType>({
  key,
  defaultValue,
  effects,
}: CreateComponentStateType<ValueType>) => {
  return atomFamily<ValueType, ComponentStateKey>({
    key,
    default: defaultValue,
    effects: effects,
  });
};
