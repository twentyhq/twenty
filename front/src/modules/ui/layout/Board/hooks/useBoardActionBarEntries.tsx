import { useSetRecoilState } from 'recoil';

import { IconTrash } from '@/ui/Display/Icon';
import { actionBarEntriesState } from '@/ui/Navigation/Action Bar/states/actionBarEntriesState';

import { useDeleteSelectedBoardCards } from './useDeleteSelectedBoardCards';

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
