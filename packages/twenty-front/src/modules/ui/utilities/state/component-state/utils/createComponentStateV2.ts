import { ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { ComponentStateKeyV2 } from '@/ui/utilities/state/component-state/types/ComponentStateKeyV2';
import { ComponentStateV2 } from '@/ui/utilities/state/component-state/types/ComponentStateV2';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { AtomEffect, atomFamily } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

type CreateComponentInstanceStateArgs<ValueType> = {
  key: string;
  defaultValue: ValueType;
  componentInstanceContext: ComponentInstanceStateContext<any> | null;
  effects?: AtomEffect<ValueType>[];
};

export const createComponentStateV2 = <ValueType>({
  key,
  defaultValue,
  componentInstanceContext,
  effects,
}: CreateComponentInstanceStateArgs<ValueType>): ComponentStateV2<ValueType> => {
  if (isDefined(componentInstanceContext)) {
    globalComponentInstanceContextMap.set(key, componentInstanceContext);
  }

  return {
    type: 'ComponentState',
    key,
    atomFamily: atomFamily<ValueType, ComponentStateKeyV2>({
      key,
      default: defaultValue,
      effects: effects,
    }),
  } satisfies ComponentStateV2<ValueType>;
};
