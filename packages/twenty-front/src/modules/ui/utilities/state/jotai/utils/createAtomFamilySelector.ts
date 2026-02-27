import { atom, type Atom } from 'jotai';

import { type FamilySelector } from '@/ui/utilities/state/jotai/types/FamilySelector';
import { type SelectorGetter } from '@/ui/utilities/state/jotai/types/SelectorCallbacks';
import { buildGetHelper } from '@/ui/utilities/state/jotai/utils/buildGetHelper';

export const createAtomFamilySelector = <ValueType, FamilyKey>({
  key,
  get,
}: {
  key: string;
  get: (familyKey: FamilyKey) => (callbacks: SelectorGetter) => ValueType;
}): FamilySelector<ValueType, FamilyKey> => {
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
    type: 'FamilySelector',
    key,
    selectorFamily,
  };
};
