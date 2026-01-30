import { useRecoilCallback } from 'recoil';

import { filterRecordOnGqlFields } from '@/object-record/cache/utils/filterRecordOnGqlFields';
import { type RecordGqlFields } from '@/object-record/graphql/record-gql-fields/types/RecordGqlFields';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type UpsertRecordsInStoreProps = {
  partialRecords: ObjectRecord[];
  recordGqlFields?: RecordGqlFields;
};

export const useUpsertRecordsInStore = () => {
  const upsertRecordsInStore = useRecoilCallback(
    ({ set, snapshot }) =>
      ({ partialRecords, recordGqlFields }: UpsertRecordsInStoreProps) => {
        for (const partialRecord of partialRecords) {
          const currentRecord = snapshot
            .getLoadable(recordStoreFamilyState(partialRecord.id))
            .getValue();

          const filteredPartialRecord = isDefined(recordGqlFields)
            ? filterRecordOnGqlFields({
                record: partialRecord,
                recordGqlFields,
              })
            : partialRecord;

          if (!isDefined(currentRecord)) {
            set(recordStoreFamilyState(partialRecord.id), {
              id: partialRecord.id,
              __typename: partialRecord.__typename,
              ...filteredPartialRecord,
            });
            continue;
          }

          const filteredCurrentRecord = isDefined(recordGqlFields)
            ? filterRecordOnGqlFields({
                record: currentRecord,
                recordGqlFields,
              })
            : currentRecord;

          if (!isDeeplyEqual(filteredCurrentRecord, filteredPartialRecord)) {
            set(recordStoreFamilyState(partialRecord.id), {
              ...currentRecord,
              ...filteredPartialRecord,
            });
          }
        }
      },
    [],
  );

  return {
    upsertRecordsInStore,
  };
};
