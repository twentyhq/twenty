import { atom, type WritableAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { isDefined } from 'twenty-shared/utils';

import { type FamilyState } from '@/ui/utilities/state/jotai/types/FamilyState';

// Jotai's synchronous storage contract (not re-exported from jotai/utils).
type JotaiSyncStorage<ValueType> = {
  getItem: (key: string, initialValue: ValueType) => ValueType;
  setItem: (key: string, newValue: ValueType) => void;
  removeItem: (key: string) => void;
};

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

    let baseAtom: WritableAtom<
      ValueType,
      [ValueType | ((prev: ValueType) => ValueType)],
      void
    >;

    if (isDefined(storage)) {
      baseAtom = atomWithStorage<ValueType>(
        atomKey,
        defaultValue,
        storage,
        localStorageOptions ?? { getOnInit: true },
      ) as typeof baseAtom;
    } else if (useLocalStorage) {
      baseAtom = atomWithStorage<ValueType>(
        atomKey,
        defaultValue,
        undefined,
        localStorageOptions ?? undefined,
      ) as typeof baseAtom;
    } else {
      baseAtom = atom(defaultValue) as typeof baseAtom;
    }

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
