import { atom, type Atom } from 'jotai';

import { type ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { type ComponentSelector } from '@/ui/utilities/state/jotai/types/ComponentSelector';
import { type SelectorGetter } from '@/ui/utilities/state/jotai/types/SelectorCallbacks';
import { buildGetHelper } from '@/ui/utilities/state/jotai/utils/buildGetHelper';
import { isDefined } from 'twenty-shared/utils';

export const createAtomComponentSelector = <ValueType>({
  key,
  get,
  componentInstanceContext,
}: {
  key: string;
  get: (key: ComponentStateKey) => (callbacks: SelectorGetter) => ValueType;
  componentInstanceContext: ComponentInstanceStateContext<any> | null;
}): ComponentSelector<ValueType> => {
  if (isDefined(componentInstanceContext)) {
    globalComponentInstanceContextMap.set(key, componentInstanceContext);
  }

  const atomCache = new Map<string, Atom<ValueType>>();

  const selectorFamily = (
    componentStateKey: ComponentStateKey,
  ): Atom<ValueType> => {
    const existing = atomCache.get(componentStateKey.instanceId);

    if (existing !== undefined) {
      return existing;
    }

    const getForKey = get(componentStateKey);

    const derivedAtom = atom((jotaiGet) => {
      const getHelper = buildGetHelper(jotaiGet);

      return getForKey({ get: getHelper });
    });

    derivedAtom.debugLabel = `${key}__${componentStateKey.instanceId}`;
    atomCache.set(componentStateKey.instanceId, derivedAtom);

    return derivedAtom;
  };

  return {
    type: 'ComponentSelector',
    key,
    selectorFamily,
  };
};
