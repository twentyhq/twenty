import { useRecoilCallback } from 'recoil';

import { useRecordBoardSelection } from '@/object-record/record-board/hooks/useRecordBoardSelection';
import { isRecordBoardCardSelectedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardSelectedComponentFamilyState';
import { allCardsSelectedStatusComponentSelector } from '@/object-record/record-board/states/selectors/allCardsSelectedStatusComponentSelector';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';

export const useSelectAllCards = (recordBoardId?: string) => {
  const allCardsSelectedStatusSelector = useRecoilComponentCallbackState(
    allCardsSelectedStatusComponentSelector,
    recordBoardId,
  );
  const isRecordBoardCardSelectedFamilyState = useRecoilComponentCallbackState(
    isRecordBoardCardSelectedComponentFamilyState,
    recordBoardId,
  );
  const recordIndexAllRecordIdsSelector = useRecoilComponentCallbackState(
    recordIndexAllRecordIdsComponentSelector,
    recordBoardId,
  );

  const { resetRecordSelection } = useRecordBoardSelection(recordBoardId);

  const selectAllCards = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const allCardsSelectedStatus = getSnapshotValue(
          snapshot,
          allCardsSelectedStatusSelector,
        );

        const allRecordIds = getSnapshotValue(
          snapshot,
          recordIndexAllRecordIdsSelector,
        );

        if (allCardsSelectedStatus === 'all') {
          resetRecordSelection();
        }

        for (const recordId of allRecordIds) {
          const isSelected =
            allCardsSelectedStatus === 'none' ||
            allCardsSelectedStatus === 'some';

          set(isRecordBoardCardSelectedFamilyState(recordId), isSelected);
        }
      },
    [
      allCardsSelectedStatusSelector,
      recordIndexAllRecordIdsSelector,
      resetRecordSelection,
      isRecordBoardCardSelectedFamilyState,
    ],
  );

  return {
    selectAllCards,
  };
};
