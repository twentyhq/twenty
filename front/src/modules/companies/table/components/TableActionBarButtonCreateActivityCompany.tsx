import { useOpenCreateActivityDrawerForSelectedRowIds } from '@/activities/hooks/useOpenCreateActivityDrawerForSelectedRowIds';
import { TableActionBarButtonToggleComments } from '@/ui/table/action-bar/components/TableActionBarButtonOpenComments';
import { TableActionBarButtonToggleTasks } from '@/ui/table/action-bar/components/TableActionBarButtonOpenTasks';
import { ActivityType, CommentableType } from '~/generated/graphql';

export function TableActionBarButtonCreateActivityCompany() {
  const openCreateActivityRightDrawer =
    useOpenCreateActivityDrawerForSelectedRowIds();

  async function handleButtonClick(type: ActivityType) {
    openCreateActivityRightDrawer(type, CommentableType.Company);
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
