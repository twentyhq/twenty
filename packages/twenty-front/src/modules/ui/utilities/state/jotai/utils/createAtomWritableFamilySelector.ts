import { atom, type WritableAtom } from 'jotai';

import {
  type SelectorGetter,
  type SelectorSetter,
} from '@/ui/utilities/state/jotai/types/SelectorCallbacks';
import { type WritableFamilySelector } from '@/ui/utilities/state/jotai/types/WritableFamilySelector';
import { buildGetHelper } from '@/ui/utilities/state/jotai/utils/buildGetHelper';
import { buildSetHelper } from '@/ui/utilities/state/jotai/utils/buildSetHelper';

export const createAtomWritableFamilySelector = <ValueType, FamilyKey>({
  key,
  get,
  set,
}: {
  key: string;
  get: (familyKey: FamilyKey) => (callbacks: SelectorGetter) => ValueType;
  set: (
    familyKey: FamilyKey,
  ) => (callbacks: SelectorSetter, newValue: ValueType) => void;
}): WritableFamilySelector<ValueType, FamilyKey> => {
  const atomCache = new Map<
    string,
    WritableAtom<
      ValueType,
      [ValueType | ((prev: ValueType) => ValueType)],
      void
    >
  >();

  const selectorFamily = (
    familyKey: FamilyKey,
  ): WritableAtom<
    ValueType,
    [ValueType | ((prev: ValueType) => ValueType)],
    void
  > => {
    const cacheKey =
      typeof familyKey === 'string' ? familyKey : JSON.stringify(familyKey);

    const existing = atomCache.get(cacheKey);

    if (existing !== undefined) {
      return existing;
    }

    const getForKey = get(familyKey);
    const setForKey = set(familyKey);

    const derivedAtom = atom(
      (jotaiGet) => {
        const getHelper = buildGetHelper(jotaiGet);

        return getForKey({ get: getHelper });
      },
      (
        jotaiGet,
        jotaiSet,
        valueOrUpdater: ValueType | ((prev: ValueType) => ValueType),
      ) => {
        const getHelper = buildGetHelper(jotaiGet);
        const setHelper = buildSetHelper(jotaiSet);

        const resolvedValue =
          typeof valueOrUpdater === 'function'
            ? (valueOrUpdater as (prev: ValueType) => ValueType)(
                getForKey({ get: getHelper }),
              )
            : valueOrUpdater;

        setForKey({ get: getHelper, set: setHelper }, resolvedValue);
      },
    );

    derivedAtom.debugLabel = `${key}__${cacheKey}`;
    atomCache.set(cacheKey, derivedAtom);

    return derivedAtom;
  };

  return {
    type: 'WritableFamilySelector',
    key,
    selectorFamily,
  };
};
