import { useRecoilState } from 'recoil';

import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';

import { useOpenRightDrawer } from '../../ui/layout/right-drawer/hooks/useOpenRightDrawer';
import { viewableCommentThreadIdState } from '../states/viewableCommentThreadIdState';

export function useOpenCommentThreadRightDrawer() {
  const openRightDrawer = useOpenRightDrawer();
  const [, setViewableCommentThreadId] = useRecoilState(
    viewableCommentThreadIdState,
  );

  return function openCommentThreadRightDrawer(commentThreadId: string) {
    setViewableCommentThreadId(commentThreadId);
    openRightDrawer(RightDrawerPages.EditCommentThread);
  };
}
