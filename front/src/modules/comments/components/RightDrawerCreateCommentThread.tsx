import { useHotkeysScopeOnMountOnly } from '@/hotkeys/hooks/useHotkeysScopeOnMountOnly';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { RightDrawerBody } from '@/ui/layout/right-drawer/components/RightDrawerBody';
import { RightDrawerPage } from '@/ui/layout/right-drawer/components/RightDrawerPage';
import { RightDrawerTopBar } from '@/ui/layout/right-drawer/components/RightDrawerTopBar';

import { CommentThreadCreateMode } from './CommentThreadCreateMode';

export function RightDrawerCreateCommentThread() {
  useHotkeysScopeOnMountOnly({
    scope: InternalHotkeysScope.RightDrawer,
    customScopes: { goto: false, 'command-menu': true },
  });
  return (
    <RightDrawerPage>
      <RightDrawerTopBar title="New comment" />
      <RightDrawerBody>
        <CommentThreadCreateMode />
      </RightDrawerBody>
    </RightDrawerPage>
  );
}
