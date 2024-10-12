import { contextStoreTargetedRecordIdsState } from '@/context-store/states/contextStoreTargetedRecordIdsState';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

export const RecordShowPageEffect = ({ recordId }: { recordId: string }) => {
  const setContextStoreTargetedRecordIds = useSetRecoilState(
    contextStoreTargetedRecordIdsState,
  );

  useEffect(() => {
    setContextStoreTargetedRecordIds([recordId]);
  }, [recordId, setContextStoreTargetedRecordIds]);

  return null;
};
