import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { useDeleteSelectedRecordBoardDeprecatedCardsInternal } from '@/object-record/record-board-deprecated/hooks/internal/useDeleteSelectedRecordBoardDeprecatedCardsInternal';
import { IconTrash } from '@/ui/display/icon';
import { actionBarEntriesState } from '@/ui/navigation/action-bar/states/actionBarEntriesState';

export const useRecordBoardDeprecatedActionBarEntriesInternal = () => {
  const setActionBarEntriesRecoil = useSetRecoilState(actionBarEntriesState);

  const deleteSelectedBoardCards =
    useDeleteSelectedRecordBoardDeprecatedCardsInternal();

  const setActionBarEntries = useCallback(() => {
    setActionBarEntriesRecoil([
      {
        label: 'Delete',
        Icon: IconTrash,
        accent: 'danger',
        onClick: deleteSelectedBoardCards,
      },
    ]);
  }, [deleteSelectedBoardCards, setActionBarEntriesRecoil]);

  return {
    setActionBarEntries,
  };
};
