import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';

import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { recordBoardPendingRecordIdByColumnComponentFamilyState } from '../states/recordBoardPendingRecordIdByColumnComponentFamilyState';

export const useCreateNewBoardRecord = (recordBoardId: string) => {
  const recordBoardPendingRecordIdByColumnState =
    useRecoilComponentCallbackStateV2(
      recordBoardPendingRecordIdByColumnComponentFamilyState,
      recordBoardId,
    );

  const createNewBoardRecord = useRecoilCallback(
    ({ set }) =>
      (columnId: string, position: 'first' | 'last') => {
        const recordId = v4();

        set(recordBoardPendingRecordIdByColumnState(columnId), {
          recordId,
          position,
        });

        return recordId;
      },
    [recordBoardPendingRecordIdByColumnState],
  );

  return {
    createNewBoardRecord,
  };
};
