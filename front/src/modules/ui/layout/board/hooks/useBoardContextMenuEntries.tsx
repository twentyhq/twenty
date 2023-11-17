import { useSetRecoilState } from 'recoil';

import { IconTrash } from '@/ui/display/icon';
import { useDeleteSelectedBoardCards } from '@/ui/layout/board/hooks/useDeleteSelectedBoardCards';
import { contextMenuEntriesState } from '@/ui/navigation/context-menu/states/contextMenuEntriesState';

export const useBoardContextMenuEntries = () => {
  const setContextMenuEntries = useSetRecoilState(contextMenuEntriesState);

  const deleteSelectedBoardCards = useDeleteSelectedBoardCards();

  return {
    setContextMenuEntries: () =>
      setContextMenuEntries([
        {
          label: 'Delete',
          Icon: IconTrash,
          accent: 'danger',
          onClick: () => deleteSelectedBoardCards(),
        },
      ]),
  };
};
