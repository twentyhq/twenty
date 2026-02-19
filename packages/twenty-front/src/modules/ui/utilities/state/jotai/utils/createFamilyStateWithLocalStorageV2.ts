import { atomWithStorage } from 'jotai/utils';

import { type FamilyStateV2 } from '@/ui/utilities/state/jotai/types/FamilyStateV2';

export const createFamilyStateWithLocalStorageV2 = <ValueType, FamilyKey>({
  key,
  defaultValue,
}: {
  key: string;
  defaultValue: ValueType;
}): FamilyStateV2<ValueType, FamilyKey> => {
  const atomCache = new Map<
    string,
    ReturnType<FamilyStateV2<ValueType, FamilyKey>['atomFamily']>
  >();

  const familyFunction = (
    familyKey: FamilyKey,
  ): ReturnType<FamilyStateV2<ValueType, FamilyKey>['atomFamily']> => {
    const cacheKey =
      typeof familyKey === 'string' ? familyKey : JSON.stringify(familyKey);

    const existing = atomCache.get(cacheKey);

    if (existing !== undefined) {
      return existing;
    }

    const storageKey = `${key}__${cacheKey}`;
    const baseAtom = atomWithStorage<ValueType>(storageKey, defaultValue);
    baseAtom.debugLabel = storageKey;
    atomCache.set(cacheKey, baseAtom);

    return baseAtom;
  };

  return {
    type: 'FamilyStateV2',
    key,
    atomFamily: familyFunction,
  };
};
