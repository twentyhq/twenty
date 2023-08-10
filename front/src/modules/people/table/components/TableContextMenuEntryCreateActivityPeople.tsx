import { IconCheckbox, IconNotes } from '@tabler/icons-react';

import { useOpenCreateActivityDrawerForSelectedRowIds } from '@/activities/hooks/useOpenCreateActivityDrawerForSelectedRowIds';
import { EntityTableContextMenuEntry } from '@/ui/table/context-menu/components/EntityTableContextMenuEntry';
import { ActivityType, CommentableType } from '~/generated/graphql';

export function TableContextMenuEntryCreateActivityPeople() {
  const openCreateActivityRightDrawer =
    useOpenCreateActivityDrawerForSelectedRowIds();

  async function handleButtonClick(type: ActivityType) {
    openCreateActivityRightDrawer(type, CommentableType.Person);
  }

  return (
    <>
      <EntityTableContextMenuEntry
        label="Note"
        icon={<IconNotes size={16} />}
        onClick={() => handleButtonClick(ActivityType.Note)}
      />
      <EntityTableContextMenuEntry
        label="Task"
        icon={<IconCheckbox size={16} />}
        onClick={() => handleButtonClick(ActivityType.Task)}
      />
    </>
  );
}
