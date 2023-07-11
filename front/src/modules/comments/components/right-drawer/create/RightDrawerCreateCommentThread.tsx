import { useRecoilValue } from 'recoil';

import { viewableCommentThreadIdState } from '@/comments/states/viewableCommentThreadIdState';
import { useHotkeysScopeOnMountOnly } from '@/hotkeys/hooks/useHotkeysScopeOnMountOnly';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { RightDrawerBody } from '@/ui/layout/right-drawer/components/RightDrawerBody';
import { RightDrawerPage } from '@/ui/layout/right-drawer/components/RightDrawerPage';
import { RightDrawerTopBar } from '@/ui/layout/right-drawer/components/RightDrawerTopBar';

import { CommentThread } from '../CommentThread';

export function RightDrawerCreateCommentThread() {
  const commentThreadId = useRecoilValue(viewableCommentThreadIdState);

  useHotkeysScopeOnMountOnly({
    scope: InternalHotkeysScope.RightDrawer,
    customScopes: { goto: false, 'command-menu': true },
  });

  return (
    <RightDrawerPage>
      <RightDrawerTopBar title="New note" />
      <RightDrawerBody>
        {commentThreadId && (
          <CommentThread
            commentThreadId={commentThreadId}
            showComment={false}
            autoFillTitle={true}
          />
        )}
      </RightDrawerBody>
    </RightDrawerPage>
  );
}
