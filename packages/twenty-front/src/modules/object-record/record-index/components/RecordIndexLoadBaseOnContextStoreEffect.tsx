import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { useEffect } from 'react';

export const RecordIndexLoadBaseOnContextStoreEffect = () => {
  const { loadRecordIndexStates } = useLoadRecordIndexStates();

  useEffect(() => {
    loadRecordIndexStates();
  }, [loadRecordIndexStates]);

  return <></>;
};
