import { useOpenCreateCommentThreadDrawerForSelectedRowIds } from '@/comments/hooks/useOpenCreateCommentDrawerForSelectedRowIds';
import { TableActionBarButtonToggleComments } from '@/ui/components/table/action-bar/TableActionBarButtonOpenComments';
import { CommentableType } from '~/generated/graphql';

export function TableActionBarButtonCreateCommentThreadPeople() {
  const openCreateCommentThreadRightDrawer =
    useOpenCreateCommentThreadDrawerForSelectedRowIds();

  async function handleButtonClick() {
    openCreateCommentThreadRightDrawer(CommentableType.Person);
  }

  return <TableActionBarButtonToggleComments onClick={handleButtonClick} />;
}
