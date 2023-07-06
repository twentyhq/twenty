import { RightDrawerBody } from '@/ui/layout/right-drawer/components/RightDrawerBody';
import { RightDrawerPage } from '@/ui/layout/right-drawer/components/RightDrawerPage';
import { RightDrawerTopBar } from '@/ui/layout/right-drawer/components/RightDrawerTopBar';

import { CommentThreadCreateMode } from './CommentThreadCreateMode';

export function RightDrawerCreateCommentThread() {
  return (
    <RightDrawerPage>
      <RightDrawerTopBar title="New note" />
      <RightDrawerBody>
        <CommentThreadCreateMode />
      </RightDrawerBody>
    </RightDrawerPage>
  );
}
