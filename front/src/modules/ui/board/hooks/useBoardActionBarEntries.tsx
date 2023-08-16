import { useSetRecoilState } from 'recoil';

import { ActionBarEntry } from '@/ui/action-bar/components/ActionBarEntry';
import { actionBarEntriesState } from '@/ui/action-bar/states/actionBarEntriesState';
import { IconTrash } from '@/ui/icon';

import { useDeleteSelectedBoardCards } from './useDeleteSelectedBoardCards';

export function useBoardActionBarEntries() {
  const setActionBarEntries = useSetRecoilState(actionBarEntriesState);

  const deleteSelectedBoardCards = useDeleteSelectedBoardCards();

  return {
    setActionBarEntries: () =>
      setActionBarEntries([
        <ActionBarEntry
          label="Delete"
          icon={<IconTrash size={16} />}
          type="danger"
          onClick={deleteSelectedBoardCards}
          key="delete"
        />,
      ]),
  };
}
