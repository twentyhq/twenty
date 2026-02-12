import { atom, type WritableAtom } from 'jotai';

import { recordStoreFamilyStateV2 } from '@/object-record/record-store/states/recordStoreFamilyStateV2';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

const fieldAtomCache = new Map<
  string,
  WritableAtom<unknown, [unknown], void>
>();

export const recordStoreFamilySelectorV2 = <T>({
  recordId,
  fieldName,
}: {
  recordId: string;
  fieldName: string;
}): WritableAtom<T, [T], void> => {
  const cacheKey = `${recordId}__${fieldName}`;
  const existing = fieldAtomCache.get(cacheKey);

  if (existing !== undefined) {
    return existing as WritableAtom<T, [T], void>;
  }

  const derivedAtom = atom(
    (get) =>
      get(recordStoreFamilyStateV2.atomFamily(recordId))?.[fieldName] as T,
    (get, set, newValue: T) => {
      set(recordStoreFamilyStateV2.atomFamily(recordId), (prevState) =>
        prevState
          ? { ...prevState, [fieldName]: newValue }
          : ({ [fieldName]: newValue } as ObjectRecord),
      );
    },
  );

  derivedAtom.debugLabel = `recordField__${cacheKey}`;
  fieldAtomCache.set(
    cacheKey,
    derivedAtom as WritableAtom<unknown, [unknown], void>,
  );

  return derivedAtom as unknown as WritableAtom<T, [T], void>;
};
