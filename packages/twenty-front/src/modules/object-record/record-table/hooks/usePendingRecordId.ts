import { useRecoilState } from 'recoil';

import { pendingRecordIdState } from '@/object-record/record-table/states/pendingRecordIdState';

export const usePendingRecordId = () => {
  const [pendingRecordId, setPendingRecordId] =
    useRecoilState(pendingRecordIdState);

  return {
    pendingRecordId,
    setPendingRecordId,
  };
};
