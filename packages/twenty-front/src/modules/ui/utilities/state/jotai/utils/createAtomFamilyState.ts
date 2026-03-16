import { atom } from 'jotai';
import { type SyncStringStorage } from 'jotai/vanilla/utils/atomWithStorage';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

import { type FamilyState } from '@/ui/utilities/state/jotai/types/FamilyState';

export const createAtomFamilyState = <ValueType, FamilyKey>({
  key,
  defaultValue,
  useLocalStorage = false,
  localStorageOptions,
  customStringStorage,
}: {
  key: string;
  defaultValue: ValueType;
  useLocalStorage?: boolean;
  localStorageOptions?: { getOnInit?: boolean };
  customStringStorage?: SyncStringStorage;
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
    const storage = customStringStorage
      ? createJSONStorage<ValueType>(() => customStringStorage)
      : undefined;
    const baseAtom = useLocalStorage
      ? atomWithStorage<ValueType>(
          atomKey,
          defaultValue,
          storage,
          localStorageOptions ?? undefined,
        )
      : atom(defaultValue);
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
