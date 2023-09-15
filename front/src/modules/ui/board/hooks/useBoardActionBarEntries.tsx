import { useSetRecoilState } from 'recoil';

import { ActionBarEntry } from '@/ui/action-bar/components/ActionBarEntry';
import { actionBarEntriesState } from '@/ui/action-bar/states/actionBarEntriesState';
import { IconTrash } from '@/ui/icon';

import { useDeleteSelectedBoardCards } from './useDeleteSelectedBoardCards';

export const useBoardActionBarEntries = () => {
  const setActionBarEntries = useSetRecoilState(actionBarEntriesState);

  const deleteSelectedBoardCards = useDeleteSelectedBoardCards();

  return {
    setActionBarEntries: () =>
      setActionBarEntries([
        <ActionBarEntry
          label="Delete"
          Icon={IconTrash}
          type="danger"
          onClick={deleteSelectedBoardCards}
          key="delete"
        />,
      ]),
  };
};
