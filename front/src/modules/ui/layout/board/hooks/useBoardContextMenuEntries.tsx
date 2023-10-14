import { useSetRecoilState } from 'recoil';

import { IconTrash } from '@/ui/display/icon';
import { contextMenuEntriesState } from '@/ui/navigation/context-menu/states/contextMenuEntriesState';

import { useDeleteSelectedBoardCards } from './useDeleteSelectedBoardCards';

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
