import { useRecoilState, useRecoilValue } from 'recoil';

import { selectedRowIdsState } from '@/ui/tables/states/selectedRowIdsState';
import { CommentableType } from '~/generated/graphql';

import { useOpenRightDrawer } from '../../ui/layout/right-drawer/hooks/useOpenRightDrawer';
import { commentableEntityArrayState } from '../states/commentableEntityArrayState';
import { CommentableEntity } from '../types/CommentableEntity';

export function useOpenCreateCommentThreadDrawerForSelectedRowIds() {
  const openRightDrawer = useOpenRightDrawer();

  const [, setCommentableEntityArray] = useRecoilState(
    commentableEntityArrayState,
  );

  const selectedPeopleIds = useRecoilValue(selectedRowIdsState);

  return function openCreateCommentDrawerForSelectedRowIds(
    entityType: CommentableType,
  ) {
    const commentableEntityArray: CommentableEntity[] = selectedPeopleIds.map(
      (id) => ({
        type: entityType,
        id,
      }),
    );

    setCommentableEntityArray(commentableEntityArray);
    openRightDrawer('create-comment-thread');
  };
}
