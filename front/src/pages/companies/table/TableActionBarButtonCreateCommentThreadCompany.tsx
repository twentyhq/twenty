import { useOpenCreateCommentThreadDrawerForSelectedRowIds } from '@/comments/hooks/useOpenCreateCommentDrawerForSelectedRowIds';
import { TableActionBarButtonToggleComments } from '@/ui/components/table/action-bar/TableActionBarButtonOpenComments';
import { CommentableType } from '~/generated/graphql';

export function TableActionBarButtonCreateCommentThreadCompany() {
  const openCreateCommentThreadRightDrawer =
    useOpenCreateCommentThreadDrawerForSelectedRowIds();

  async function handleButtonClick() {
    openCreateCommentThreadRightDrawer(CommentableType.Company);
  }

  return <TableActionBarButtonToggleComments onClick={handleButtonClick} />;
}
