import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { IconTrash } from '@/ui/display/icon';
import { contextMenuEntriesState } from '@/ui/navigation/context-menu/states/contextMenuEntriesState';
import { useDeleteSelectedRecordBoardCardsInternal } from '@/ui/object/record-board/hooks/internal/useDeleteSelectedRecordBoardCardsInternal';

export const useRecordBoardContextMenuEntriesInternal = () => {
  const setContextMenuEntriesRecoil = useSetRecoilState(
    contextMenuEntriesState,
  );

  const deleteSelectedBoardCards = useDeleteSelectedRecordBoardCardsInternal();

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
