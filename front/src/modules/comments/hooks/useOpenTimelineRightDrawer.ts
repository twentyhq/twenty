import { useRecoilState } from 'recoil';

import { useSetHotkeyScope } from '@/lib/hotkeys/hooks/useSetHotkeyScope';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
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
  const setHotkeyScope = useSetHotkeyScope();

  return function openTimelineRightDrawer(
    commentableEntityArray: CommentableEntity[],
  ) {
    setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
    setCommentableEntityArray(commentableEntityArray);
    openRightDrawer(RightDrawerPages.Timeline);
  };
}
