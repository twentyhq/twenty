import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { isDefined } from 'twenty-shared/utils';

type RecordStoreRecordsFamilyKey = {
  recordIds: string[];
};

export const recordStoreRecordsSelector = createAtomFamilySelector<
  ObjectRecord[],
  RecordStoreRecordsFamilyKey
>({
  key: 'recordStoreRecordsSelector',
  get:
    ({ recordIds }: RecordStoreRecordsFamilyKey) =>
    ({ get }) =>
      recordIds
        .map((recordId) => get(recordStoreFamilyState, recordId))
        .filter(isDefined),
});
