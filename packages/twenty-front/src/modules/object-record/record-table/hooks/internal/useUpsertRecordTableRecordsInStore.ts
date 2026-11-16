import { getLookupRelatedRecords } from '@/object-record/record-column-lookup/utils/getLookupRelatedRecords';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useCallback } from 'react';

export const useUpsertRecordTableRecordsInStore = () => {
  const { upsertRecordsInStore } = useUpsertRecordsInStore();
  const { columnDescriptorByRecordFieldId } = useRecordIndexContextOrThrow();

  const upsertRecordTableRecordsInStore = useCallback(
    (records: ObjectRecord[]) => {
      upsertRecordsInStore({
        partialRecords: [
          ...records,
          ...getLookupRelatedRecords({
            records,
            columnDescriptorByRecordFieldId,
          }),
        ],
      });
    },
    [upsertRecordsInStore, columnDescriptorByRecordFieldId],
  );

  return { upsertRecordTableRecordsInStore };
};
