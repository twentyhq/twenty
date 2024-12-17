import { ReactNode, useEffect } from 'react';

import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const JestRecordStoreSetter = ({
  children,
  records,
}: {
  children: ReactNode;
  records: ObjectRecord[];
}) => {
  const { upsertRecords } = useUpsertRecordsInStore();

  useEffect(() => {
    upsertRecords(records);
  });

  return <>{children}</>;
};
