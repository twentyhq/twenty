import { useRecoilState, useRecoilValue } from 'recoil';

import { selectedRowIdsState } from '@/ui/tables/states/selectedRowIdsState';
import { CommentableType } from '~/generated/graphql';

import { useOpenRightDrawer } from '../../ui/layout/right-drawer/hooks/useOpenRightDrawer';
import { commentableEntityArrayState } from '../states/commentableEntityArrayState';
import { createdCommentThreadIdState } from '../states/createdCommentThreadIdState';
import { CommentableEntity } from '../types/CommentableEntity';

export function useOpenCreateCommentThreadDrawerForSelectedRowIds() {
  const openRightDrawer = useOpenRightDrawer();

  const [, setCommentableEntityArray] = useRecoilState(
    commentableEntityArrayState,
  );

  const [, setCreatedCommentThreadId] = useRecoilState(
    createdCommentThreadIdState,
  );

  const selectedEntityIds = useRecoilValue(selectedRowIdsState);

  return function openCreateCommentDrawerForSelectedRowIds(
    entityType: CommentableType,
  ) {
    const commentableEntityArray: CommentableEntity[] = selectedEntityIds.map(
      (id) => ({
        type: entityType,
        id,
      }),
    );

    setCreatedCommentThreadId(null);
    setCommentableEntityArray(commentableEntityArray);
    openRightDrawer('create-comment-thread');
  };
}
