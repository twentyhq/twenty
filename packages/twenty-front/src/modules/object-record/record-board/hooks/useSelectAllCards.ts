import { useRecoilCallback } from 'recoil';

import { useResetRecordBoardSelection } from '@/object-record/record-board/hooks/useResetRecordBoardSelection';
import { isRecordBoardCardSelectedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardSelectedComponentFamilyState';
import { allCardsSelectedStatusComponentSelector } from '@/object-record/record-board/states/selectors/allCardsSelectedStatusComponentSelector';
import { allRecordIdsOfAllRecordGroupsComponentSelector } from '@/object-record/record-index/states/selectors/allRecordIdsOfAllRecordGroupsComponentSelector';
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
  const allRecordIdsOfAllRecordGroupsCallbackSelector =
    useRecoilComponentCallbackState(
      allRecordIdsOfAllRecordGroupsComponentSelector,
      recordBoardId,
    );

  const { resetRecordBoardSelection } =
    useResetRecordBoardSelection(recordBoardId);

  const selectAllCards = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const allCardsSelectedStatus = getSnapshotValue(
          snapshot,
          allCardsSelectedStatusSelector,
        );

        const allRecordIds = getSnapshotValue(
          snapshot,
          allRecordIdsOfAllRecordGroupsCallbackSelector,
        );

        if (allCardsSelectedStatus === 'all') {
          resetRecordBoardSelection();
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
      allRecordIdsOfAllRecordGroupsCallbackSelector,
      resetRecordBoardSelection,
      isRecordBoardCardSelectedFamilyState,
    ],
  );

  return {
    selectAllCards,
  };
};
