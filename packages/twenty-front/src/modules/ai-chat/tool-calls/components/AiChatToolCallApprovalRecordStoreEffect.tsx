import { useEffect } from 'react';

import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

// the fields' current values are displayed from the record store, which nothing else fills for this record
export const AiChatToolCallApprovalRecordStoreEffect = ({
  record,
}: {
  record: ObjectRecord;
}) => {
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  useEffect(() => {
    upsertRecordsInStore({ partialRecords: [record] });
  }, [record, upsertRecordsInStore]);

  return null;
};
