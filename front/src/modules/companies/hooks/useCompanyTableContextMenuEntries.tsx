import { useSetRecoilState } from 'recoil';

import { useOpenCreateActivityDrawerForSelectedRowIds } from '@/activities/hooks/useOpenCreateActivityDrawerForSelectedRowIds';
import { ActivityTargetableEntityType } from '@/activities/types/ActivityTargetableEntity';
import { ContextMenuEntry } from '@/ui/context-menu/components/ContextMenuEntry';
import { contextMenuEntriesState } from '@/ui/context-menu/states/contextMenuEntriesState';
import { IconCheckbox, IconNotes, IconTrash } from '@/ui/icon';
import { ActivityType } from '~/generated/graphql';

import { useDeleteSelectedComapnies } from './useDeleteCompanies';

export const useCompanyTableContextMenuEntries = () => {
  const setContextMenuEntries = useSetRecoilState(contextMenuEntriesState);

  const openCreateActivityRightDrawer =
    useOpenCreateActivityDrawerForSelectedRowIds();

  const handleButtonClick = async (type: ActivityType) => {
    openCreateActivityRightDrawer(type, ActivityTargetableEntityType.Company);
  };

  const deleteSelectedCompanies = useDeleteSelectedComapnies();

  return {
    setContextMenuEntries: () =>
      setContextMenuEntries([
        <ContextMenuEntry
          label="Note"
          Icon={IconNotes}
          onClick={() => handleButtonClick(ActivityType.Note)}
          key="note"
        />,
        <ContextMenuEntry
          label="Task"
          Icon={IconCheckbox}
          onClick={() => handleButtonClick(ActivityType.Task)}
          key="task"
        />,
        <ContextMenuEntry
          label="Delete"
          Icon={IconTrash}
          accent="danger"
          onClick={() => deleteSelectedCompanies()}
          key="delete"
        />,
      ]),
  };
};
