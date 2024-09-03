import { AtomEffect, atomFamily, SerializableParam } from 'recoil';

import { InstanceFamilyStateKey } from '@/ui/utilities/state/instance/types/InstanceFamilyStateKey';
import { InstanceStateContext } from '@/ui/utilities/state/instance/types/InstanceStateContext';
import { globalInstanceContextMap } from '@/ui/utilities/state/instance/utils/globalInstanceContextMap';
import { isDefined } from 'twenty-ui';

type CreateInstanceFamilyStateArgs<ValueType> = {
  key: string;
  defaultValue: ValueType;
  instanceContext: InstanceStateContext<any> | null;
  effects?: AtomEffect<ValueType>[];
};

export const createInstanceFamilyState = <
  ValueType,
  FamilyKey extends SerializableParam,
>({
  key,
  effects,
  defaultValue,
  instanceContext,
}: CreateInstanceFamilyStateArgs<ValueType>) => {
  if (isDefined(instanceContext)) {
    globalInstanceContextMap.set(key, instanceContext);
  }

  return {
    key,
    atomFamily: atomFamily<ValueType, InstanceFamilyStateKey<FamilyKey>>({
      key,
      default: defaultValue,
      effects,
    }),
  };
};
