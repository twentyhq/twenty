import { IconCheckbox, IconNotes } from '@tabler/icons-react';

import { useOpenCreateActivityDrawerForSelectedRowIds } from '@/activities/hooks/useOpenCreateActivityDrawerForSelectedRowIds';
import { EntityTableActionBarButton } from '@/ui/table/action-bar/components/EntityTableActionBarButton';
import { ActivityType, CommentableType } from '~/generated/graphql';

export function TableActionBarButtonCreateActivityCompany() {
  const openCreateActivityRightDrawer =
    useOpenCreateActivityDrawerForSelectedRowIds();

  async function handleButtonClick(type: ActivityType) {
    openCreateActivityRightDrawer(type, CommentableType.Company);
  }

  return (
    <>
      <EntityTableActionBarButton
        label="Note"
        icon={<IconNotes size={16} />}
        onClick={() => handleButtonClick(ActivityType.Note)}
      />
      <EntityTableActionBarButton
        label="Task"
        icon={<IconCheckbox size={16} />}
        onClick={() => handleButtonClick(ActivityType.Task)}
      />
    </>
  );
}
