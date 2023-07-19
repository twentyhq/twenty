import { useRecoilState } from 'recoil';

import { useSetHotkeyScope } from '@/ui/hotkey/hooks/useSetHotkeyScope';
import { useRightDrawer } from '@/ui/right-drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/right-drawer/types/RightDrawerPages';

import { viewableCommentThreadIdState } from '../states/viewableCommentThreadIdState';

export function useOpenCommentThreadRightDrawer() {
  const { openRightDrawer } = useRightDrawer();
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
