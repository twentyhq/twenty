import { AtomEffect, atomFamily } from 'recoil';

import { InstanceState } from '@/ui/utilities/state/instance/types/InstanceState';
import { InstanceStateContext } from '@/ui/utilities/state/instance/types/InstanceStateContext';
import { InstanceStateKey } from '@/ui/utilities/state/instance/types/InstanceStateKey';
import { globalInstanceContextMap } from '@/ui/utilities/state/instance/utils/globalInstanceContextMap';
import { isDefined } from '~/utils/isDefined';

type CreateInstaceStateArgs<ValueType> = {
  key: string;
  defaultValue: ValueType;
  instanceContext: InstanceStateContext<any> | null;
  effects?: AtomEffect<ValueType>[];
};

export const createInstanceState = <ValueType>({
  key,
  defaultValue,
  instanceContext,
  effects,
}: CreateInstaceStateArgs<ValueType>): InstanceState<ValueType> => {
  if (isDefined(instanceContext)) {
    globalInstanceContextMap.set(key, instanceContext);
  }

  return {
    key,
    atomFamily: atomFamily<ValueType, InstanceStateKey>({
      key,
      default: defaultValue,
      effects: effects,
    }),
  };
};
