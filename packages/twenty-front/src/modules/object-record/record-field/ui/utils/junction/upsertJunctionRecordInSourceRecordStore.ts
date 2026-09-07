import { type Store } from 'jotai/vanilla/store';
import { isDefined } from 'twenty-shared/utils';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export const upsertJunctionRecordInSourceRecordStore = ({
  store,
  sourceRecordId,
  sourceFieldName,
  junctionRecord,
}: {
  store: Store;
  sourceRecordId: string;
  sourceFieldName: string;
  junctionRecord: ObjectRecord;
}) => {
  store.set(
    recordStoreFamilyState.atomFamily(sourceRecordId),
    (currentRecord) => {
      if (!isDefined(currentRecord)) {
        return currentRecord;
      }

      const currentJunctionRecords = Array.isArray(
        currentRecord[sourceFieldName],
      )
        ? currentRecord[sourceFieldName]
        : [];
      const existingJunctionIndex = currentJunctionRecords.findIndex(
        ({ id }) => id === junctionRecord.id,
      );
      const nextJunctionRecords = [...currentJunctionRecords];

      if (existingJunctionIndex === -1) {
        nextJunctionRecords.push(junctionRecord);
      } else {
        nextJunctionRecords[existingJunctionIndex] = {
          ...nextJunctionRecords[existingJunctionIndex],
          ...junctionRecord,
        };
      }

      return {
        ...currentRecord,
        [sourceFieldName]: nextJunctionRecords,
      } as ObjectRecord;
    },
  );
};
