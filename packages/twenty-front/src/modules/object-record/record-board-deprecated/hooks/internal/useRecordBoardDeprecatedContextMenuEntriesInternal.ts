import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { useDeleteSelectedRecordBoardDeprecatedCardsInternal } from '@/object-record/record-board-deprecated/hooks/internal/useDeleteSelectedRecordBoardDeprecatedCardsInternal';
import { IconTrash } from '@/ui/display/icon';
import { contextMenuEntriesState } from '@/ui/navigation/context-menu/states/contextMenuEntriesState';

export const useRecordBoardDeprecatedContextMenuEntriesInternal = () => {
  const setContextMenuEntriesRecoil = useSetRecoilState(
    contextMenuEntriesState,
  );

  const deleteSelectedBoardCards =
    useDeleteSelectedRecordBoardDeprecatedCardsInternal();

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
