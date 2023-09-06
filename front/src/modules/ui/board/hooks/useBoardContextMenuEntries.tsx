import { useSetRecoilState } from 'recoil';

import { ContextMenuEntry } from '@/ui/context-menu/components/ContextMenuEntry';
import { contextMenuEntriesState } from '@/ui/context-menu/states/contextMenuEntriesState';
import { IconTrash } from '@/ui/icon';

import { useDeleteSelectedBoardCards } from './useDeleteSelectedBoardCards';

export function useBoardContextMenuEntries() {
  const setContextMenuEntries = useSetRecoilState(contextMenuEntriesState);

  const deleteSelectedBoardCards = useDeleteSelectedBoardCards();

  return {
    setContextMenuEntries: () =>
      setContextMenuEntries([
        <ContextMenuEntry
          label="Delete"
          Icon={IconTrash}
          accent="danger"
          onClick={() => deleteSelectedBoardCards()}
          key="delete"
        />,
      ]),
  };
}
