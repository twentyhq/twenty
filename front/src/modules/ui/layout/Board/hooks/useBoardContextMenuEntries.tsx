import { useSetRecoilState } from 'recoil';

import { IconTrash } from '@/ui/Display/Icon';
import { contextMenuEntriesState } from '@/ui/Navigation/Context Menu/states/contextMenuEntriesState';

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
