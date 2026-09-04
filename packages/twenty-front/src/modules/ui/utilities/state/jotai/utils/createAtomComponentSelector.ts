import { atom, type Atom } from 'jotai';
import { selectAtom } from 'jotai/utils';

import { type ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { getComponentAtomCacheKey } from '@/ui/utilities/state/component-state/utils/getComponentAtomCacheKey';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { type ComponentSelector } from '@/ui/utilities/state/jotai/types/ComponentSelector';
import { type SelectorGetter } from '@/ui/utilities/state/jotai/types/SelectorCallbacks';
import { buildGetHelper } from '@/ui/utilities/state/jotai/utils/buildGetHelper';
import { isDefined } from 'twenty-shared/utils';

export const createAtomComponentSelector = <ValueType>({
  key,
  get,
  componentInstanceContext,
  areEqual,
}: {
  key: string;
  get: (key: ComponentStateKey) => (callbacks: SelectorGetter) => ValueType;
  componentInstanceContext: ComponentInstanceStateContext<any> | null;
  areEqual?: (previous: ValueType, next: ValueType) => boolean;
}): ComponentSelector<ValueType> => {
  if (isDefined(componentInstanceContext)) {
    globalComponentInstanceContextMap.set(key, componentInstanceContext);
  }

  const surfaceScope = componentInstanceContext?.surfaceScope ?? 'per-surface';

  const atomCache = new Map<string, Atom<ValueType>>();

  const selectorFamily = (
    componentStateKey: ComponentStateKey,
  ): Atom<ValueType> => {
    const cacheKey = getComponentAtomCacheKey({
      surfaceScope,
      ...componentStateKey,
    });

    const existing = atomCache.get(cacheKey);

    if (existing !== undefined) {
      return existing;
    }

    const getForKey = get(componentStateKey);

    const derivedAtom = atom((jotaiGet) => {
      const getHelper = buildGetHelper(jotaiGet);

      return getForKey({ get: getHelper });
    });

    const finalAtom = isDefined(areEqual)
      ? selectAtom(derivedAtom, (value) => value, areEqual)
      : derivedAtom;

    finalAtom.debugLabel = `${key}__${cacheKey}`;
    atomCache.set(cacheKey, finalAtom);

    return finalAtom;
  };

  return {
    type: 'ComponentSelector',
    key,
    selectorFamily,
  };
};
