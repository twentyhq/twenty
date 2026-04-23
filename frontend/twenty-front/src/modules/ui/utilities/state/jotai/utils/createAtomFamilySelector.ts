import { atom, type Atom } from 'jotai';
import { selectAtom } from 'jotai/utils';

import { type FamilySelector } from '@/ui/utilities/state/jotai/types/FamilySelector';
import { type SelectorGetter } from '@/ui/utilities/state/jotai/types/SelectorCallbacks';
import { buildGetHelper } from '@/ui/utilities/state/jotai/utils/buildGetHelper';
import { isDefined } from 'twenty-shared/utils';

export const createAtomFamilySelector = <ValueType, FamilyKey>({
  key,
  get,
  areEqual,
}: {
  key: string;
  get: (familyKey: FamilyKey) => (callbacks: SelectorGetter) => ValueType;
  areEqual?: (previous: ValueType, next: ValueType) => boolean;
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

    const finalAtom = isDefined(areEqual)
      ? selectAtom(derivedAtom, (value) => value, areEqual)
      : derivedAtom;

    finalAtom.debugLabel = `${key}__${cacheKey}`;
    atomCache.set(cacheKey, finalAtom);

    return finalAtom;
  };

  return {
    type: 'FamilySelector',
    key,
    selectorFamily,
  };
};
