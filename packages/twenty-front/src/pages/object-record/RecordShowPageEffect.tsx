import { contextStoreTargetedRecordsState } from '@/context-store/states/contextStoreTargetedRecordsState';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

export const RecordShowPageEffect = ({ recordId }: { recordId: string }) => {
  const setcontextStoreTargetedRecords = useSetRecoilState(
    contextStoreTargetedRecordsState,
  );

  useEffect(() => {
    setcontextStoreTargetedRecords({
      selectedRecordIds: [recordId],
      excludedRecordIds: [],
    });
  }, [recordId, setcontextStoreTargetedRecords]);

  return null;
};
