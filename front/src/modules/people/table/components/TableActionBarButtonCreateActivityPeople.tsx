import { useOpenCreateActivityDrawerForSelectedRowIds } from '@/activities/hooks/useOpenCreateActivityDrawerForSelectedRowIds';
import { TableActionBarButtonToggleComments } from '@/ui/table/action-bar/components/TableActionBarButtonOpenComments';
import { TableActionBarButtonToggleTasks } from '@/ui/table/action-bar/components/TableActionBarButtonOpenTasks';
import { ActivityType, CommentableType } from '~/generated/graphql';

export function TableActionBarButtonCreateActivityPeople() {
  const openCreateActivityRightDrawer =
    useOpenCreateActivityDrawerForSelectedRowIds();

  async function handleButtonClick(type: ActivityType) {
    openCreateActivityRightDrawer(type, CommentableType.Person);
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
