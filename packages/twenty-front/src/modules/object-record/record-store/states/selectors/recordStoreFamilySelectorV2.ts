import { recordStoreFamilyStateV2 } from '@/object-record/record-store/states/recordStoreFamilyStateV2';
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
      get(recordStoreFamilyStateV2, recordId)?.[fieldName],
  set:
    ({ recordId, fieldName }) =>
    ({ set }, newValue) => {
      set(recordStoreFamilyStateV2, recordId, (prev) =>
        prev
          ? { ...prev, [fieldName]: newValue }
          : ({ [fieldName]: newValue } as ObjectRecord),
      );
    },
});
