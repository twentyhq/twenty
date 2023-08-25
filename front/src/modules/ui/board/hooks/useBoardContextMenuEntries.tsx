import { IconTrash } from '@tabler/icons-react';
import { useSetRecoilState } from 'recoil';

import { ContextMenuEntry } from '@/ui/context-menu/components/ContextMenuEntry';
import { contextMenuEntriesState } from '@/ui/context-menu/states/contextMenuEntriesState';

import { useDeleteSelectedBoardCards } from './useDeleteSelectedBoardCards';

export function useBoardContextMenuEntries() {
  const setContextMenuEntries = useSetRecoilState(contextMenuEntriesState);

  const deleteSelectedBoardCards = useDeleteSelectedBoardCards();

  return {
    setContextMenuEntries: () =>
      setContextMenuEntries([
        <ContextMenuEntry
          label="Delete"
          icon={<IconTrash size={16} />}
          accent="danger"
          onClick={() => deleteSelectedBoardCards()}
          key="delete"
        />,
      ]),
  };
}
