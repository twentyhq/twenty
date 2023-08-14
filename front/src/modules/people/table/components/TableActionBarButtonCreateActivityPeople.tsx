import { useOpenCreateActivityDrawerForSelectedRowIds } from '@/activities/hooks/useOpenCreateActivityDrawerForSelectedRowIds';
import { ActivityTargetableEntityType } from '@/activities/types/ActivityTargetableEntity';
import { TableActionBarButtonToggleComments } from '@/ui/table/action-bar/components/TableActionBarButtonOpenComments';
import { TableActionBarButtonToggleTasks } from '@/ui/table/action-bar/components/TableActionBarButtonOpenTasks';
import { ActivityType } from '~/generated/graphql';

export function TableActionBarButtonCreateActivityPeople() {
  const openCreateActivityRightDrawer =
    useOpenCreateActivityDrawerForSelectedRowIds();

  async function handleButtonClick(type: ActivityType) {
    openCreateActivityRightDrawer(type, ActivityTargetableEntityType.Person);
  }

  return (
    <>
      <TableActionBarButtonToggleComments
        onClick={() => handleButtonClick(ActivityType.Note)}
      />
      <TableActionBarButtonToggleTasks
        onClick={() => handleButtonClick(ActivityType.Task)}
      />
    </>
  );
}
