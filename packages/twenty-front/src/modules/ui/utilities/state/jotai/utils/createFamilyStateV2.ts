import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import { type FamilyStateV2 } from '@/ui/utilities/state/jotai/types/FamilyStateV2';

export const createFamilyStateV2 = <ValueType, FamilyKey>({
  key,
  defaultValue,
  useLocalStorage = false,
}: {
  key: string;
  defaultValue: ValueType;
  useLocalStorage?: boolean;
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

    const atomKey = `${key}__${cacheKey}`;
    const baseAtom = useLocalStorage
      ? atomWithStorage<ValueType>(atomKey, defaultValue)
      : atom(defaultValue);
    baseAtom.debugLabel = atomKey;
    atomCache.set(cacheKey, baseAtom);

    return baseAtom;
  };

  return {
    type: 'FamilyStateV2',
    key,
    atomFamily: familyFunction,
  };
};
