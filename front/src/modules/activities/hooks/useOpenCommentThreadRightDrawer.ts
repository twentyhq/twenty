import { useRecoilState } from 'recoil';

import { useSetHotkeyScope } from '@/ui/hotkey/hooks/useSetHotkeyScope';
import { useOpenRightDrawer } from '@/ui/right-drawer/hooks/useOpenRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/right-drawer/types/RightDrawerPages';

import { viewableCommentThreadIdState } from '../states/viewableCommentThreadIdState';

export function useOpenCommentThreadRightDrawer() {
  const openRightDrawer = useOpenRightDrawer();
  const [, setViewableCommentThreadId] = useRecoilState(
    viewableCommentThreadIdState,
  );
  const setHotkeyScope = useSetHotkeyScope();

  return function openCommentThreadRightDrawer(commentThreadId: string) {
    setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
    setViewableCommentThreadId(commentThreadId);
    openRightDrawer(RightDrawerPages.EditCommentThread);
  };
}
