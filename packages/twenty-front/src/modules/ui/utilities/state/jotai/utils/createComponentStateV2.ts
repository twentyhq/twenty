import { atom } from 'jotai';

import { type ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { type ComponentStateV2 } from '@/ui/utilities/state/jotai/types/ComponentStateV2';
import { isDefined } from 'twenty-shared/utils';

export const createComponentStateV2 = <ValueType>({
  key,
  defaultValue,
  componentInstanceContext,
}: {
  key: string;
  defaultValue: ValueType;
  componentInstanceContext: ComponentInstanceStateContext<any> | null;
}): ComponentStateV2<ValueType> => {
  if (isDefined(componentInstanceContext)) {
    globalComponentInstanceContextMap.set(key, componentInstanceContext);
  }

  const atomCache = new Map<
    string,
    ReturnType<ComponentStateV2<ValueType>['atomFamily']>
  >();

  const familyFunction = ({
    instanceId,
  }: ComponentStateKey): ReturnType<
    ComponentStateV2<ValueType>['atomFamily']
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
    type: 'ComponentStateV2',
    key,
    atomFamily: familyFunction,
  };
};
