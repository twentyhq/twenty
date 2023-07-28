import { useOpenCreateActivityDrawerForSelectedRowIds } from '@/activities/hooks/useOpenCreateActivityDrawerForSelectedRowIds';
import { TableActionBarButtonToggleComments } from '@/ui/table/action-bar/components/TableActionBarButtonOpenComments';
import { CommentableType } from '~/generated/graphql';

export function TableActionBarButtonCreateActivityCompany() {
  const openCreateActivityRightDrawer =
    useOpenCreateActivityDrawerForSelectedRowIds();

  async function handleButtonClick() {
    openCreateActivityRightDrawer(CommentableType.Company);
  }

  return <TableActionBarButtonToggleComments onClick={handleButtonClick} />;
}
