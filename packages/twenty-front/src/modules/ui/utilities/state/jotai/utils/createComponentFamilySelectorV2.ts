import { atom, type Atom } from 'jotai';

import { type ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { type ComponentFamilySelectorV2 } from '@/ui/utilities/state/jotai/types/ComponentFamilySelectorV2';
import { type ComponentFamilyStateKey } from '@/ui/utilities/state/jotai/types/ComponentFamilyStateV2';
import { type SelectorGetterV2 } from '@/ui/utilities/state/jotai/types/SelectorCallbacksV2';
import { buildGetHelper } from '@/ui/utilities/state/jotai/utils/buildGetHelper';
import { isDefined } from 'twenty-shared/utils';

export const createComponentFamilySelectorV2 = <ValueType, FamilyKey>({
  key,
  get,
  componentInstanceContext,
}: {
  key: string;
  get: (
    key: ComponentFamilyStateKey<FamilyKey>,
  ) => (callbacks: SelectorGetterV2) => ValueType;
  componentInstanceContext: ComponentInstanceStateContext<any> | null;
}): ComponentFamilySelectorV2<ValueType, FamilyKey> => {
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

    derivedAtom.debugLabel = `${key}__${cacheKey}`;
    atomCache.set(cacheKey, derivedAtom);

    return derivedAtom;
  };

  return {
    type: 'ComponentFamilySelectorV2',
    key,
    selectorFamily,
  };
};
