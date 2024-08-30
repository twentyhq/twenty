import { AtomEffect, atomFamily } from 'recoil';

import { RecoilComponentStateKey } from '@/ui/utilities/state/component-state/types/RecoilComponentStateKey';

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
  return atomFamily<ValueType, RecoilComponentStateKey>({
    key,
    default: defaultValue,
    effects: effects,
  });
};
