import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { IconTrash } from '@/ui/display/icon';
import { contextMenuEntriesState } from '@/ui/navigation/context-menu/states/contextMenuEntriesState';
import { useDeleteSelectedBoardCards } from '@/ui/object/record-board/hooks/useDeleteSelectedBoardCards';

export const useBoardContextMenuEntries = () => {
  const setContextMenuEntriesRecoil = useSetRecoilState(
    contextMenuEntriesState,
  );

  const deleteSelectedBoardCards = useDeleteSelectedBoardCards();

  const setContextMenuEntries = useCallback(() => {
    setContextMenuEntriesRecoil([
      {
        label: 'Delete',
        Icon: IconTrash,
        accent: 'danger',
        onClick: deleteSelectedBoardCards,
      },
    ]);
  }, [deleteSelectedBoardCards, setContextMenuEntriesRecoil]);

  return {
    setContextMenuEntries,
  };
};
