import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { filterRecordOnGqlFields } from '@/object-record/cache/utils/filterRecordOnGqlFields';
import { type RecordGqlFields } from 'twenty-shared/types';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { getSelectedRelationRecords } from '@/object-record/record-store/utils/getSelectedRelationRecords';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useCallback } from 'react';
import { useStore } from 'jotai';
import { fastDeepEqual, isDefined } from 'twenty-shared/utils';

type UpsertRecordsInStoreProps = {
  partialRecords: ObjectRecord[];
  recordGqlFields?: RecordGqlFields;
};

export const useUpsertRecordsInStore = () => {
  const store = useStore();

  const upsertRecordsInStore = useCallback(
    ({ partialRecords, recordGqlFields }: UpsertRecordsInStoreProps) => {
      const upsertRecordInStore = (
        partialRecord: ObjectRecord,
        gqlFields?: RecordGqlFields,
      ) => {
        const currentRecord = store.get(
          recordStoreFamilyState.atomFamily(partialRecord.id),
        );

        const filteredPartialRecord = isDefined(gqlFields)
          ? filterRecordOnGqlFields({
              record: partialRecord,
              recordGqlFields: gqlFields,
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
          return;
        }

        const filteredCurrentRecord = isDefined(gqlFields)
          ? filterRecordOnGqlFields({
              record: currentRecord,
              recordGqlFields: gqlFields,
            })
          : currentRecord;

        // Comparing only the selected fields present keeps a thinner snapshot from rewriting a fuller stored one
        const hasChangedField = Object.entries(filteredPartialRecord).some(
          ([fieldName, value]) =>
            !fastDeepEqual(filteredCurrentRecord[fieldName], value),
        );

        if (hasChangedField) {
          store.set(recordStoreFamilyState.atomFamily(partialRecord.id), {
            ...currentRecord,
            ...filteredPartialRecord,
          });
        }
      };

      const objectMetadataItems = store.get(objectMetadataItemsSelector.atom);

      for (const partialRecord of partialRecords) {
        upsertRecordInStore(partialRecord, recordGqlFields);

        // Cells that read a related record by id, like lookup columns, need it stored on its own
        for (const relatedRecord of getSelectedRelationRecords({
          record: partialRecord,
          recordGqlFields,
          objectMetadataItems,
        })) {
          upsertRecordInStore(relatedRecord);
        }
      }
    },
    [store],
  );

  return {
    upsertRecordsInStore,
  };
};
