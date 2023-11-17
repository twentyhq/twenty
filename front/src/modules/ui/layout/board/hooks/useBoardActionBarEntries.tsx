import { useSetRecoilState } from 'recoil';

import { IconTrash } from '@/ui/display/icon';
import { useDeleteSelectedBoardCards } from '@/ui/layout/board/hooks/useDeleteSelectedBoardCards';
import { actionBarEntriesState } from '@/ui/navigation/action-bar/states/actionBarEntriesState';

export const useBoardActionBarEntries = () => {
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
};
