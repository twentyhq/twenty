import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { createWritableFamilySelectorV2 } from '@/ui/utilities/state/jotai/utils/createWritableFamilySelectorV2';

export const recordStoreFamilySelectorV2 = createWritableFamilySelectorV2<
  unknown,
  { recordId: string; fieldName: string }
>({
  key: 'recordStoreFamilySelectorV2',
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
