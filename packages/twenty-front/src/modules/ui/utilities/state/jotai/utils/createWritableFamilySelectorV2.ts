import { atom, type WritableAtom } from 'jotai';

import {
  type SelectorGetterV2,
  type SelectorSetterV2,
} from '@/ui/utilities/state/jotai/types/SelectorCallbacksV2';
import { type WritableFamilySelectorV2 } from '@/ui/utilities/state/jotai/types/WritableFamilySelectorV2';
import { buildGetHelper } from '@/ui/utilities/state/jotai/utils/buildGetHelper';
import { buildSetHelper } from '@/ui/utilities/state/jotai/utils/buildSetHelper';

export const createWritableFamilySelectorV2 = <ValueType, FamilyKey>({
  key,
  get,
  set,
}: {
  key: string;
  get: (familyKey: FamilyKey) => (callbacks: SelectorGetterV2) => ValueType;
  set: (
    familyKey: FamilyKey,
  ) => (callbacks: SelectorSetterV2, newValue: ValueType) => void;
}): WritableFamilySelectorV2<ValueType, FamilyKey> => {
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
    type: 'WritableFamilySelectorV2',
    key,
    selectorFamily,
  };
};
