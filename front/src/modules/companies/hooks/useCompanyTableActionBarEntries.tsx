import { useSetRecoilState } from 'recoil';

import { useOpenCreateActivityDrawerForSelectedRowIds } from '@/activities/hooks/useOpenCreateActivityDrawerForSelectedRowIds';
import { ActivityTargetableEntityType } from '@/activities/types/ActivityTargetableEntity';
import { IconCheckbox, IconNotes, IconTrash } from '@/ui/display/icon';
import { actionBarEntriesState } from '@/ui/navigation/action-bar/states/actionBarEntriesState';
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
        {
          label: 'Note',
          Icon: IconNotes,
          onClick: () => handleActivityClick(ActivityType.Note),
        },
        {
          label: 'Task',
          Icon: IconCheckbox,
          onClick: () => handleActivityClick(ActivityType.Task),
        },
        {
          label: 'Delete',
          Icon: IconTrash,
          accent: 'danger',
          onClick: () => deleteSelectedCompanies(),
        },
      ]),
  };
};
