import { AtomEffect, atomFamily } from 'recoil';

import { ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';

export const createComponentState = <ValueType>({
  key,
  defaultValue,
  effects,
}: {
  key: string;
  defaultValue: ValueType;
  effects?: AtomEffect<ValueType>[];
}) => {
  return atomFamily<ValueType, ComponentStateKey>({
    key,
    default: defaultValue,
    effects: effects,
  });
};
