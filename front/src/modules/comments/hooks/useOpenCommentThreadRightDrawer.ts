import { useRecoilState } from 'recoil';

import { useSetHotkeysScope } from '@/hotkeys/hooks/useSetHotkeysScope';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
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
    setHotkeysScope(InternalHotkeysScope.RightDrawer, { goto: false });
    setViewableCommentThreadId(commentThreadId);
    openRightDrawer(RightDrawerPages.EditCommentThread);
  };
}
