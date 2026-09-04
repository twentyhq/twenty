import { atom } from 'jotai';

import { type ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { getComponentAtomCacheKey } from '@/ui/utilities/state/component-state/utils/getComponentAtomCacheKey';
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

  const surfaceScope = componentInstanceContext?.surfaceScope ?? 'per-surface';

  const atomCache = new Map<
    string,
    ReturnType<ComponentState<ValueType>['atomFamily']>
  >();

  const familyFunction = ({
    instanceId,
    surfaceId,
  }: ComponentStateKey): ReturnType<
    ComponentState<ValueType>['atomFamily']
  > => {
    const cacheKey = getComponentAtomCacheKey({
      surfaceScope,
      instanceId,
      surfaceId,
    });

    const existing = atomCache.get(cacheKey);

    if (existing !== undefined) {
      return existing;
    }

    const baseAtom = atom(defaultValue);
    baseAtom.debugLabel = `${key}__${cacheKey}`;
    atomCache.set(cacheKey, baseAtom);

    return baseAtom;
  };

  return {
    type: 'ComponentState',
    key,
    atomFamily: familyFunction,
  };
};
