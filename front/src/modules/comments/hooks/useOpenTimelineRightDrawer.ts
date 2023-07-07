import { useRecoilState } from 'recoil';

import { useOpenRightDrawer } from '../../ui/layout/right-drawer/hooks/useOpenRightDrawer';
import { commentableEntityArrayState } from '../states/commentableEntityArrayState';
import { CommentableEntity } from '../types/CommentableEntity';

export function useOpenTimelineRightDrawer() {
  const openRightDrawer = useOpenRightDrawer();
  const [, setCommentableEntityArray] = useRecoilState(
    commentableEntityArrayState,
  );

  return function openCommentRightDrawer(
    commentableEntityArray: CommentableEntity[],
  ) {
    setCommentableEntityArray(commentableEntityArray);
    openRightDrawer('comments');
  };
}
