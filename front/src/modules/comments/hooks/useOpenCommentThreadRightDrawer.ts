import { useRecoilState } from 'recoil';

import { useSetHotkeysScope } from '@/lib/hotkeys/hooks/useSetHotkeysScope';
import { HotkeyScope } from '@/ui/layout/right-drawer/types/HotkeyScope';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';

import { useOpenRightDrawer } from '../../ui/layout/right-drawer/hooks/useOpenRightDrawer';
import { viewableCommentThreadIdState } from '../states/viewableCommentThreadIdState';

export function useOpenCommentThreadRightDrawer() {
  const openRightDrawer = useOpenRightDrawer();
  const [, setViewableCommentThreadId] = useRecoilState(
    viewableCommentThreadIdState,
  );
  const setHotkeysScope = useSetHotkeysScope();

  return function openCommentThreadRightDrawer(commentThreadId: string) {
    setHotkeysScope(HotkeyScope.RightDrawer, { goto: false });
    setViewableCommentThreadId(commentThreadId);
    openRightDrawer(RightDrawerPages.EditCommentThread);
  };
}
