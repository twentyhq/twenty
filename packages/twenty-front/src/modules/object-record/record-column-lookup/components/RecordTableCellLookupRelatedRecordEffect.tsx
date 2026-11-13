import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useEffect } from 'react';

// The table stores related records nested in their parent, but field cells read them by their own id
export const RecordTableCellLookupRelatedRecordEffect = ({
  relatedRecord,
}: {
  relatedRecord: ObjectRecord;
}) => {
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  useEffect(() => {
    upsertRecordsInStore({ partialRecords: [relatedRecord] });
  }, [relatedRecord, upsertRecordsInStore]);

  return null;
};
