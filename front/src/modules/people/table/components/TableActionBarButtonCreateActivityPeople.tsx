import { useOpenCreateActivityDrawerForSelectedRowIds } from '@/activities/hooks/useOpenCreateActivityDrawerForSelectedRowIds';
import { TableActionBarButtonToggleComments } from '@/ui/table/action-bar/components/TableActionBarButtonOpenComments';
import { CommentableType } from '~/generated/graphql';

export function TableActionBarButtonCreateActivityPeople() {
  const openCreateActivityRightDrawer =
    useOpenCreateActivityDrawerForSelectedRowIds();

  async function handleButtonClick() {
    openCreateActivityRightDrawer(CommentableType.Person);
  }

  return <TableActionBarButtonToggleComments onClick={handleButtonClick} />;
}
