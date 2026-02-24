import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { createFamilySelectorV2 } from '@/ui/utilities/state/jotai/utils/createFamilySelectorV2';
import { isDefined } from 'twenty-shared/utils';

type RecordStoreRecordsFamilyKey = {
  recordIds: string[];
};

export const recordStoreRecordsSelectorV2 = createFamilySelectorV2<
  ObjectRecord[],
  RecordStoreRecordsFamilyKey
>({
  key: 'recordStoreRecordsSelectorV2',
  get:
    ({ recordIds }: RecordStoreRecordsFamilyKey) =>
    ({ get }) =>
      recordIds
        .map((recordId) => get(recordStoreFamilyState, recordId))
        .filter(isDefined),
});
