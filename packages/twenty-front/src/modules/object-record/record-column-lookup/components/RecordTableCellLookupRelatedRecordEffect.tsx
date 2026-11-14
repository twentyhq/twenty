import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useEffect } from 'react';

// A nested record is a snapshot of the parent query: copy each snapshot once,
// so a remounting cell cannot overwrite values saved since that query
const copiedRelatedRecordSnapshots = new WeakSet<ObjectRecord>();

export const RecordTableCellLookupRelatedRecordEffect = ({
  relatedRecord,
}: {
  relatedRecord: ObjectRecord;
}) => {
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  useEffect(() => {
    if (copiedRelatedRecordSnapshots.has(relatedRecord)) {
      return;
    }

    copiedRelatedRecordSnapshots.add(relatedRecord);
    upsertRecordsInStore({ partialRecords: [relatedRecord] });
  }, [relatedRecord, upsertRecordsInStore]);

  return null;
};
