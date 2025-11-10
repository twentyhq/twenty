import { type ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { type ComponentState } from '@/ui/utilities/state/component-state/types/ComponentState';
import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { type AtomEffect, atomFamily } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

type CreateComponentInstanceStateArgs<ValueType> = {
  key: string;
  defaultValue: ValueType;
  componentInstanceContext: ComponentInstanceStateContext<any> | null;
  effects?: ((param: ComponentStateKey) => AtomEffect<ValueType>)[];
};

export const createComponentState = <ValueType>({
  key,
  defaultValue,
  componentInstanceContext,
  effects,
}: CreateComponentInstanceStateArgs<ValueType>): ComponentState<ValueType> => {
  if (isDefined(componentInstanceContext)) {
    globalComponentInstanceContextMap.set(key, componentInstanceContext);
  }

  return {
    type: 'ComponentState',
    key,
    atomFamily: atomFamily<ValueType, ComponentStateKey>({
      key,
      default: defaultValue,
      effects: isDefined(effects)
        ? (param) => effects.map((effect) => effect(param))
        : undefined,
    }),
  } satisfies ComponentState<ValueType>;
};
