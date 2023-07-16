import { useOpenCreateCommentThreadDrawerForSelectedRowIds } from '@/activities/hooks/useOpenCreateCommentDrawerForSelectedRowIds';
import { TableActionBarButtonToggleComments } from '@/ui/table/action-bar/components/TableActionBarButtonOpenComments';
import { CommentableType } from '~/generated/graphql';

export function TableActionBarButtonCreateCommentThreadCompany() {
  const openCreateCommentThreadRightDrawer =
    useOpenCreateCommentThreadDrawerForSelectedRowIds();

  async function handleButtonClick() {
    openCreateCommentThreadRightDrawer(CommentableType.Company);
  }

  return <TableActionBarButtonToggleComments onClick={handleButtonClick} />;
}
