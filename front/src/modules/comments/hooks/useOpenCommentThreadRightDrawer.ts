import { useRecoilState } from 'recoil';

import { useOpenRightDrawer } from '../../ui/layout/right-drawer/hooks/useOpenRightDrawer';
import { commentableEntityArrayState } from '../states/commentableEntityArrayState';
import { viewableCommentThreadIdState } from '../states/viewableCommentThreadIdState';
import { CommentableEntity } from '../types/CommentableEntity';

export function useOpenCommentThreadRightDrawer() {
  const openRightDrawer = useOpenRightDrawer();
  const [, setViewableCommentThreadId] = useRecoilState(
    viewableCommentThreadIdState,
  );

  return function openCommentThreadRightDrawer(commentThreadId: string) {
    setViewableCommentThreadId(commentThreadId);
    openRightDrawer('edit-comment-thread');
  };
}
