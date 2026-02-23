import { selectorFamily } from 'recoil';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

export const recordStoreFamilySelector = selectorFamily({
  key: 'recordStoreFamilySelector',
  get:
    <T>({ fieldName, recordId }: { fieldName: string; recordId: string }) =>
    () =>
      jotaiStore.get(
        recordStoreFamilyState.atomFamily(recordId),
      )?.[fieldName] as T,
  set:
    <T>({ fieldName, recordId }: { fieldName: string; recordId: string }) =>
    (_: unknown, newValue: T) => {
      const atom = recordStoreFamilyState.atomFamily(recordId);
      const prevState = jotaiStore.get(atom);
      jotaiStore.set(atom, prevState
        ? { ...prevState, [fieldName]: newValue }
        : ({ [fieldName]: newValue } as ObjectRecord));
    },
});
