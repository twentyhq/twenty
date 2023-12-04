import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { IconTrash } from '@/ui/display/icon';
import { actionBarEntriesState } from '@/ui/navigation/action-bar/states/actionBarEntriesState';
import { useDeleteSelectedRecordBoardCardsInternal } from '@/ui/object/record-board/hooks/internal/useDeleteSelectedRecordBoardCardsInternal';

export const useRecordBoardActionBarEntriesInternal = () => {
  const setActionBarEntriesRecoil = useSetRecoilState(actionBarEntriesState);

  const deleteSelectedBoardCards = useDeleteSelectedRecordBoardCardsInternal();

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
