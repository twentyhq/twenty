import { useResetRecordBoardSelection } from '@/object-record/record-board/hooks/useResetRecordBoardSelection';
import { isRecordBoardCardSelectedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardSelectedComponentFamilyState';
import { allCardsSelectedStatusComponentSelector } from '@/object-record/record-board/states/selectors/allCardsSelectedStatusComponentSelector';
import { allRecordIdsOfAllRecordGroupsComponentSelector } from '@/object-record/record-index/states/selectors/allRecordIdsOfAllRecordGroupsComponentSelector';
import { useRecoilComponentFamilyStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyStateCallbackStateV2';
import { useRecoilComponentSelectorCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorCallbackStateV2';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useSelectAllCards = (recordBoardId?: string) => {
  const allCardsSelectedStatus = useRecoilComponentSelectorCallbackStateV2(
    allCardsSelectedStatusComponentSelector,
    recordBoardId,
  );
  const isRecordBoardCardSelectedFamilyState =
    useRecoilComponentFamilyStateCallbackStateV2(
      isRecordBoardCardSelectedComponentFamilyState,
      recordBoardId,
    );
  const allRecordIdsOfAllRecordGroups =
    useRecoilComponentSelectorCallbackStateV2(
      allRecordIdsOfAllRecordGroupsComponentSelector,
      recordBoardId,
    );

  const { resetRecordBoardSelection } =
    useResetRecordBoardSelection(recordBoardId);

  const store = useStore();

  const selectAllCards = useCallback(() => {
    const currentAllCardsSelectedStatus = store.get(allCardsSelectedStatus);
    const allRecordIds = store.get(allRecordIdsOfAllRecordGroups);

    if (currentAllCardsSelectedStatus === 'all') {
      resetRecordBoardSelection();
    }

    for (const recordId of allRecordIds) {
      const isSelected =
        currentAllCardsSelectedStatus === 'none' ||
        currentAllCardsSelectedStatus === 'some';

      store.set(isRecordBoardCardSelectedFamilyState(recordId), isSelected);
    }
  }, [
    allCardsSelectedStatus,
    allRecordIdsOfAllRecordGroups,
    resetRecordBoardSelection,
    isRecordBoardCardSelectedFamilyState,
    store,
  ]);

  return {
    selectAllCards,
  };
};
