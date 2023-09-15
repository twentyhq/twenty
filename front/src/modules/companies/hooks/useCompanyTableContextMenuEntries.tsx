import { useSetRecoilState } from 'recoil';

import { useOpenCreateActivityDrawerForSelectedRowIds } from '@/activities/hooks/useOpenCreateActivityDrawerForSelectedRowIds';
import { ActivityTargetableEntityType } from '@/activities/types/ActivityTargetableEntity';
import { contextMenuEntriesState } from '@/ui/context-menu/states/contextMenuEntriesState';
import { IconCheckbox, IconNotes, IconTrash } from '@/ui/icon';
import { ActivityType } from '~/generated/graphql';

import { useDeleteSelectedComapnies } from './useDeleteCompanies';

export function useCompanyTableContextMenuEntries() {
  const setContextMenuEntries = useSetRecoilState(contextMenuEntriesState);

  const openCreateActivityRightDrawer =
    useOpenCreateActivityDrawerForSelectedRowIds();

  async function handleButtonClick(type: ActivityType) {
    openCreateActivityRightDrawer(type, ActivityTargetableEntityType.Company);
  }

  const deleteSelectedCompanies = useDeleteSelectedComapnies();

  return {
    setContextMenuEntries: () =>
      setContextMenuEntries([
        {
          label: 'Note',
          Icon: IconNotes,
          onClick: () => handleButtonClick(ActivityType.Note),
        },
        {
          label: 'Task',
          Icon: IconCheckbox,
          onClick: () => handleButtonClick(ActivityType.Task),
        },
        {
          label: 'Delete',
          Icon: IconTrash,
          accent: 'danger',
          onClick: () => deleteSelectedCompanies(),
        },
      ]),
  };
}
