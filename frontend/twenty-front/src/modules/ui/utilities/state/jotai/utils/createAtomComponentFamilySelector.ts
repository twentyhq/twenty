import { atom, type Atom } from 'jotai';
import { selectAtom } from 'jotai/utils';

import { type ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { type ComponentFamilySelector } from '@/ui/utilities/state/jotai/types/ComponentFamilySelector';
import { type ComponentFamilyStateKey } from '@/ui/utilities/state/jotai/types/ComponentFamilyState';
import { type SelectorGetter } from '@/ui/utilities/state/jotai/types/SelectorCallbacks';
import { buildGetHelper } from '@/ui/utilities/state/jotai/utils/buildGetHelper';
import { isDefined } from 'twenty-shared/utils';

export const createAtomComponentFamilySelector = <ValueType, FamilyKey>({
  key,
  get,
  componentInstanceContext,
  areEqual,
}: {
  key: string;
  get: (
    key: ComponentFamilyStateKey<FamilyKey>,
  ) => (callbacks: SelectorGetter) => ValueType;
  componentInstanceContext: ComponentInstanceStateContext<any> | null;
  areEqual?: (previous: ValueType, next: ValueType) => boolean;
}): ComponentFamilySelector<ValueType, FamilyKey> => {
  if (isDefined(componentInstanceContext)) {
    globalComponentInstanceContextMap.set(key, componentInstanceContext);
  }

  const atomCache = new Map<string, Atom<ValueType>>();

  const selectorFamily = (
    componentFamilyStateKey: ComponentFamilyStateKey<FamilyKey>,
  ): Atom<ValueType> => {
    const familyKeyStr =
      typeof componentFamilyStateKey.familyKey === 'string'
        ? componentFamilyStateKey.familyKey
        : JSON.stringify(componentFamilyStateKey.familyKey);
    const cacheKey = `${componentFamilyStateKey.instanceId}__${familyKeyStr}`;
    const existing = atomCache.get(cacheKey);

    if (existing !== undefined) {
      return existing;
    }

    const getForKey = get(componentFamilyStateKey);

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
    type: 'ComponentFamilySelector',
    key,
    selectorFamily,
  };
};
