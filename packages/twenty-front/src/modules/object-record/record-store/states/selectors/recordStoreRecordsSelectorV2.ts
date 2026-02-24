import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { createFamilySelector } from '@/ui/utilities/state/jotai/utils/createFamilySelector';
import { isDefined } from 'twenty-shared/utils';

type RecordStoreRecordsFamilyKey = {
  recordIds: string[];
};

export const recordStoreRecordsSelectorV2 = createFamilySelector<
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
