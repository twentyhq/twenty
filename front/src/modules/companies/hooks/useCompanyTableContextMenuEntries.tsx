import { IconCheckbox, IconNotes, IconTrash } from '@tabler/icons-react';
import { useSetRecoilState } from 'recoil';

import { useOpenCreateActivityDrawerForSelectedRowIds } from '@/activities/hooks/useOpenCreateActivityDrawerForSelectedRowIds';
import { ActivityTargetableEntityType } from '@/activities/types/ActivityTargetableEntity';
import { ContextMenuEntry } from '@/ui/context-menu/components/ContextMenuEntry';
import { contextMenuEntriesState } from '@/ui/context-menu/states/contextMenuEntriesState';
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
        <ContextMenuEntry
          label="Note"
          icon={<IconNotes size={16} />}
          onClick={() => handleButtonClick(ActivityType.Note)}
          key="note"
        />,
        <ContextMenuEntry
          label="Task"
          icon={<IconCheckbox size={16} />}
          onClick={() => handleButtonClick(ActivityType.Task)}
          key="task"
        />,
        <ContextMenuEntry
          label="Delete"
          icon={<IconTrash size={16} />}
          accent="danger"
          onClick={() => deleteSelectedCompanies()}
          key="delete"
        />,
      ]),
  };
}
