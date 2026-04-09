import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { createAtomWritableFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomWritableFamilySelector';

export const recordStoreFamilySelector = createAtomWritableFamilySelector<
  unknown,
  { recordId: string; fieldName: string }
>({
  key: 'recordStoreFamilySelector',
  get:
    ({ recordId, fieldName }) =>
    ({ get }) =>
      get(recordStoreFamilyState, recordId)?.[fieldName],
  set:
    ({ recordId, fieldName }) =>
    ({ set }, newValue) => {
      set(recordStoreFamilyState, recordId, (prev) =>
        prev
          ? { ...prev, [fieldName]: newValue }
          : ({ [fieldName]: newValue } as ObjectRecord),
      );
    },
});
