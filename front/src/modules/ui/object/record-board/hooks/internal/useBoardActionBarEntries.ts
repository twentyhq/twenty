import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { IconTrash } from '@/ui/display/icon';
import { actionBarEntriesState } from '@/ui/navigation/action-bar/states/actionBarEntriesState';
import { useDeleteSelectedBoardCards } from '@/ui/object/record-board/hooks/useDeleteSelectedBoardCards';

export const useBoardActionBarEntries = () => {
  const setActionBarEntriesRecoil = useSetRecoilState(actionBarEntriesState);

  const deleteSelectedBoardCards = useDeleteSelectedBoardCards();

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
