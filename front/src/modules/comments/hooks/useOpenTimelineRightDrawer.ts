import { useRecoilState } from 'recoil';

import { useSetHotkeysScope } from '@/hotkeys/hooks/useSetHotkeysScope';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';

import { useOpenRightDrawer } from '../../ui/layout/right-drawer/hooks/useOpenRightDrawer';
import { commentableEntityArrayState } from '../states/commentableEntityArrayState';
import { CommentableEntity } from '../types/CommentableEntity';

// TODO: refactor with recoil callback to avoid rerender
export function useOpenTimelineRightDrawer() {
  const openRightDrawer = useOpenRightDrawer();
  const [, setCommentableEntityArray] = useRecoilState(
    commentableEntityArrayState,
  );
  const setHotkeysScope = useSetHotkeysScope();

  return function openTimelineRightDrawer(
    commentableEntityArray: CommentableEntity[],
  ) {
    setHotkeysScope(InternalHotkeysScope.RightDrawer, { goto: false });
    setCommentableEntityArray(commentableEntityArray);
    openRightDrawer(RightDrawerPages.Timeline);
  };
}
