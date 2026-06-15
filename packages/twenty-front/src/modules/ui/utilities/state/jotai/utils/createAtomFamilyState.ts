import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { isDefined } from 'twenty-shared/utils';

import { type FamilyState } from '@/ui/utilities/state/jotai/types/FamilyState';
import { type JotaiSyncStorage } from '@/ui/utilities/state/jotai/types/JotaiSyncStorage';

export const createAtomFamilyState = <ValueType, FamilyKey>({
  key,
  defaultValue,
  useLocalStorage = false,
  localStorageOptions,
  storage,
}: {
  key: string;
  defaultValue: ValueType;
  useLocalStorage?: boolean;
  localStorageOptions?: { getOnInit?: boolean };
  // Custom synchronous storage (e.g. IndexedDB-backed). When provided it takes
  // precedence over useLocalStorage and is shared across all family members.
  storage?: JotaiSyncStorage<ValueType>;
}): FamilyState<ValueType, FamilyKey> => {
  const atomCache = new Map<
    string,
    ReturnType<FamilyState<ValueType, FamilyKey>['atomFamily']>
  >();

  const familyFunction = (
    familyKey: FamilyKey,
  ): ReturnType<FamilyState<ValueType, FamilyKey>['atomFamily']> => {
    const cacheKey =
      typeof familyKey === 'string' ? familyKey : JSON.stringify(familyKey);

    const existing = atomCache.get(cacheKey);

    if (existing !== undefined) {
      return existing;
    }

    const atomKey = `${key}__${cacheKey}`;

    const buildBaseAtom = () => {
      if (isDefined(storage)) {
        return atomWithStorage<ValueType>(
          atomKey,
          defaultValue,
          storage,
          localStorageOptions ?? { getOnInit: true },
        );
      }

      if (useLocalStorage) {
        return atomWithStorage<ValueType>(
          atomKey,
          defaultValue,
          undefined,
          localStorageOptions ?? undefined,
        );
      }

      return atom(defaultValue);
    };

    const baseAtom = buildBaseAtom();
    baseAtom.debugLabel = atomKey;
    atomCache.set(cacheKey, baseAtom);

    return baseAtom;
  };

  return Object.assign(familyFunction, {
    type: 'FamilyState' as const,
    key,
    atomFamily: familyFunction,
  });
};
