import { useRecoilValue } from 'recoil';

import { viewableCommentThreadIdState } from '@/comments/states/viewableCommentThreadIdState';
import { useHotkeysScopeOnMountOnly } from '@/hotkeys/hooks/useHotkeysScopeOnMountOnly';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { RightDrawerBody } from '@/ui/layout/right-drawer/components/RightDrawerBody';
import { RightDrawerPage } from '@/ui/layout/right-drawer/components/RightDrawerPage';
import { RightDrawerTopBar } from '@/ui/layout/right-drawer/components/RightDrawerTopBar';

import { CommentThread } from '../CommentThread';

export function RightDrawerEditCommentThread() {
  useHotkeysScopeOnMountOnly({
    scope: InternalHotkeysScope.RightDrawer,
    customScopes: { goto: false, 'command-menu': true },
  });
  const commentThreadId = useRecoilValue(viewableCommentThreadIdState);
  return (
    <RightDrawerPage>
      <RightDrawerTopBar title="" />
      <RightDrawerBody>
        {commentThreadId && <CommentThread commentThreadId={commentThreadId} />}
      </RightDrawerBody>
    </RightDrawerPage>
  );
}
