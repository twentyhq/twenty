import { useRecoilState } from 'recoil';

import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';

import { useOpenRightDrawer } from '../../ui/layout/right-drawer/hooks/useOpenRightDrawer';
import { commentableEntityArrayState } from '../states/commentableEntityArrayState';
import { CommentableEntity } from '../types/CommentableEntity';

export function useOpenTimelineRightDrawer() {
  const openRightDrawer = useOpenRightDrawer();
  const [, setCommentableEntityArray] = useRecoilState(
    commentableEntityArrayState,
  );

  return function openTimelineRightDrawer(
    commentableEntityArray: CommentableEntity[],
  ) {
    setCommentableEntityArray(commentableEntityArray);
    openRightDrawer(RightDrawerPages.Timeline);
  };
}
