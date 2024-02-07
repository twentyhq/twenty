import { useRecoilCallback } from 'recoil';

import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';

export const useResetBoardRecordSelection = (recordBoardId?: string) => {
  const { getSelectedRecordIdsSelector, isRecordBoardCardSelectedFamilyState } =
    useRecordBoardStates(recordBoardId);

  const resetRecordSelection = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const recordIds = snapshot
          .getLoadable(getSelectedRecordIdsSelector())
          .getValue();

        for (const recordId of recordIds) {
          set(isRecordBoardCardSelectedFamilyState(recordId), false);
        }
      },
    [getSelectedRecordIdsSelector, isRecordBoardCardSelectedFamilyState],
  );

  return { resetRecordSelection };
};
