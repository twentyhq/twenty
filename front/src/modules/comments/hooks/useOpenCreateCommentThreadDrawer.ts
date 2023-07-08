import { useRecoilState } from 'recoil';

import { useOpenRightDrawer } from '../../ui/layout/right-drawer/hooks/useOpenRightDrawer';
import { commentableEntityArrayState } from '../states/commentableEntityArrayState';
import { CommentableEntity } from '../types/CommentableEntity';

export function useOpenCreateCommentThreadDrawer() {
  const openRightDrawer = useOpenRightDrawer();

  const [, setCommentableEntityArray] = useRecoilState(
    commentableEntityArrayState,
  );

  return function openCreateCommentThreadDrawer(entity: CommentableEntity) {
    setCommentableEntityArray([entity]);
    openRightDrawer('create-comment-thread');
  };
}
