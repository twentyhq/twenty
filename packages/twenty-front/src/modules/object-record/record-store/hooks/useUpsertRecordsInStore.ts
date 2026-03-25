import { filterRecordOnGqlFields } from '@/object-record/cache/utils/filterRecordOnGqlFields';
import { type RecordGqlFields } from '@/object-record/graphql/record-gql-fields/types/RecordGqlFields';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useCallback } from 'react';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type UpsertRecordsInStoreProps = {
  partialRecords: ObjectRecord[];
  recordGqlFields?: RecordGqlFields;
};

export const useUpsertRecordsInStore = () => {
  const store = useStore();

  const upsertRecordsInStore = useCallback(
    ({ partialRecords, recordGqlFields }: UpsertRecordsInStoreProps) => {
      for (const partialRecord of partialRecords) {
        const currentRecord = store.get(
          recordStoreFamilyState.atomFamily(partialRecord.id),
        );

        const filteredPartialRecord = isDefined(recordGqlFields)
          ? filterRecordOnGqlFields({
              record: partialRecord,
              recordGqlFields,
            })
          : partialRecord;

        if (!isDefined(currentRecord)) {
          const newRecord = {
            id: partialRecord.id,
            __typename: partialRecord.__typename,
            ...filteredPartialRecord,
          };
          store.set(
            recordStoreFamilyState.atomFamily(partialRecord.id),
            newRecord,
          );
          continue;
        }

        const filteredCurrentRecord = isDefined(recordGqlFields)
          ? filterRecordOnGqlFields({
              record: currentRecord,
              recordGqlFields,
            })
          : currentRecord;

        if (!isDeeplyEqual(filteredCurrentRecord, filteredPartialRecord)) {
          const updatedRecord = {
            ...currentRecord,
            ...filteredPartialRecord,
          };
          store.set(
            recordStoreFamilyState.atomFamily(partialRecord.id),
            updatedRecord,
          );
        }
      }
    },
    [store],
  );

  return {
    upsertRecordsInStore,
  };
};
