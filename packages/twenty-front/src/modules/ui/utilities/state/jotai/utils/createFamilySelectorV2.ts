import { atom, type Atom } from 'jotai';

import { type FamilySelectorV2 } from '@/ui/utilities/state/jotai/types/FamilySelectorV2';
import { type SelectorGetterV2 } from '@/ui/utilities/state/jotai/types/SelectorCallbacksV2';
import { buildGetHelper } from '@/ui/utilities/state/jotai/utils/buildGetHelper';

export const createFamilySelectorV2 = <ValueType, FamilyKey>({
  key,
  get,
}: {
  key: string;
  get: (familyKey: FamilyKey) => (callbacks: SelectorGetterV2) => ValueType;
}): FamilySelectorV2<ValueType, FamilyKey> => {
  const atomCache = new Map<string, Atom<ValueType>>();

  const selectorFamily = (familyKey: FamilyKey): Atom<ValueType> => {
    const cacheKey =
      typeof familyKey === 'string' ? familyKey : JSON.stringify(familyKey);

    const existing = atomCache.get(cacheKey);

    if (existing !== undefined) {
      return existing;
    }

    const getForKey = get(familyKey);

    const derivedAtom = atom((jotaiGet) => {
      const getHelper = buildGetHelper(jotaiGet);

      return getForKey({ get: getHelper });
    });

    derivedAtom.debugLabel = `${key}__${cacheKey}`;
    atomCache.set(cacheKey, derivedAtom);

    return derivedAtom;
  };

  return {
    type: 'FamilySelectorV2',
    key,
    selectorFamily,
  };
};
