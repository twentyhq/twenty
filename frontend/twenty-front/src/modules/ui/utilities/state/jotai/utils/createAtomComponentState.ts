import { atom } from 'jotai';

import { type ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { type ComponentState } from '@/ui/utilities/state/jotai/types/ComponentState';
import { isDefined } from 'twenty-shared/utils';

export const createAtomComponentState = <ValueType>({
  key,
  defaultValue,
  componentInstanceContext,
}: {
  key: string;
  defaultValue: ValueType;
  componentInstanceContext: ComponentInstanceStateContext<any> | null;
}): ComponentState<ValueType> => {
  if (isDefined(componentInstanceContext)) {
    globalComponentInstanceContextMap.set(key, componentInstanceContext);
  }

  const atomCache = new Map<
    string,
    ReturnType<ComponentState<ValueType>['atomFamily']>
  >();

  const familyFunction = ({
    instanceId,
  }: ComponentStateKey): ReturnType<
    ComponentState<ValueType>['atomFamily']
  > => {
    const existing = atomCache.get(instanceId);

    if (existing !== undefined) {
      return existing;
    }

    const baseAtom = atom(defaultValue);
    baseAtom.debugLabel = `${key}__${instanceId}`;
    atomCache.set(instanceId, baseAtom);

    return baseAtom;
  };

  return {
    type: 'ComponentState',
    key,
    atomFamily: familyFunction,
  };
};
