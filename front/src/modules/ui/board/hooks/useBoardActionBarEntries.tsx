import { useSetRecoilState } from 'recoil';

import { actionBarEntriesState } from '@/ui/action-bar/states/actionBarEntriesState';
import { IconTrash } from '@/ui/icon';

import { useDeleteSelectedBoardCards } from './useDeleteSelectedBoardCards';

export function useBoardActionBarEntries() {
  const setActionBarEntries = useSetRecoilState(actionBarEntriesState);

  const deleteSelectedBoardCards = useDeleteSelectedBoardCards();

  return {
    setActionBarEntries: () =>
      setActionBarEntries([
        {
          label: 'Delete',
          Icon: IconTrash,
          accent: 'danger',
          onClick: deleteSelectedBoardCards,
        },
      ]),
  };
}
