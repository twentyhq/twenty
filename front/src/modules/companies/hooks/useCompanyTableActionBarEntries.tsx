import { useSetRecoilState } from 'recoil';

import { useOpenCreateActivityDrawerForSelectedRowIds } from '@/activities/hooks/useOpenCreateActivityDrawerForSelectedRowIds';
import { ActivityTargetableEntityType } from '@/activities/types/ActivityTargetableEntity';
import { ActionBarEntry } from '@/ui/action-bar/components/ActionBarEntry';
import { actionBarEntriesState } from '@/ui/action-bar/states/actionBarEntriesState';
import { IconCheckbox, IconNotes, IconTrash } from '@/ui/icon';
import { ActivityType } from '~/generated/graphql';

import { useDeleteSelectedComapnies } from './useDeleteCompanies';

export const useCompanyTableActionBarEntries = () => {
  const setActionBarEntries = useSetRecoilState(actionBarEntriesState);

  const openCreateActivityRightDrawer =
    useOpenCreateActivityDrawerForSelectedRowIds();

  const handleActivityClick = async (type: ActivityType) => {
    openCreateActivityRightDrawer(type, ActivityTargetableEntityType.Company);
  };

  const deleteSelectedCompanies = useDeleteSelectedComapnies();
  return {
    setActionBarEntries: () =>
      setActionBarEntries([
        <ActionBarEntry
          label="Note"
          Icon={IconNotes}
          onClick={() => handleActivityClick(ActivityType.Note)}
          key="note"
        />,
        <ActionBarEntry
          label="Task"
          Icon={IconCheckbox}
          onClick={() => handleActivityClick(ActivityType.Task)}
          key="task"
        />,
        <ActionBarEntry
          label="Delete"
          Icon={IconTrash}
          type="danger"
          onClick={() => deleteSelectedCompanies()}
          key="delete"
        />,
      ]),
  };
};
