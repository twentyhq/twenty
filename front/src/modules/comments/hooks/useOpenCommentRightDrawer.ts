import { useRecoilState } from 'recoil';
import { useOpenRightDrawer } from '../../ui/layout/right-drawer/hooks/useOpenRightDrawer';
import { CommentableEntity } from '../types/CommentableEntity';
import { commentableEntityArrayState } from '../states/commentableEntityArrayState';

export function useOpenCommentRightDrawer() {
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
