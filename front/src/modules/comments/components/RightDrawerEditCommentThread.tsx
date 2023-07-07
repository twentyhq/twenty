import { RightDrawerBody } from '@/ui/layout/right-drawer/components/RightDrawerBody';
import { RightDrawerPage } from '@/ui/layout/right-drawer/components/RightDrawerPage';
import { RightDrawerTopBar } from '@/ui/layout/right-drawer/components/RightDrawerTopBar';
import { CommentableType } from '~/generated/graphql';

import { CommentThreadEditMode } from './CommentThreadEditMode';

export function RightDrawerEditCommentThread() {
  return (
    <RightDrawerPage>
      <RightDrawerTopBar title="" />
      <RightDrawerBody>
        <CommentThreadEditMode commentThreadId="twenty-fe256b39-3ec3-4fe3-8997-b76aa0bfb400" />
      </RightDrawerBody>
    </RightDrawerPage>
  );
}
