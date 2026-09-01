import { type Store } from 'jotai/vanilla/store';
import { isDefined } from 'twenty-shared/utils';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export const appendJunctionRecordToSourceRecordStore = ({
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

      const currentJunctionRecords = currentRecord[sourceFieldName];

      if (
        Array.isArray(currentJunctionRecords) &&
        currentJunctionRecords.some(({ id }) => id === junctionRecord.id)
      ) {
        return currentRecord;
      }

      return {
        ...currentRecord,
        [sourceFieldName]: [
          ...(Array.isArray(currentJunctionRecords)
            ? currentJunctionRecords
            : []),
          junctionRecord,
        ],
      } as ObjectRecord;
    },
  );
};
