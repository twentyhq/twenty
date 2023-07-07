import { useRecoilValue } from 'recoil';

import { RightDrawerBody } from '@/ui/layout/right-drawer/components/RightDrawerBody';
import { RightDrawerPage } from '@/ui/layout/right-drawer/components/RightDrawerPage';
import { RightDrawerTopBar } from '@/ui/layout/right-drawer/components/RightDrawerTopBar';
import { CommentableType } from '~/generated/graphql';

import { viewableCommentThreadIdState } from '../states/viewableCommentThreadIdState';

import { CommentThreadEditMode } from './CommentThreadEditMode';

export function RightDrawerEditCommentThread() {
  const commentThreadId = useRecoilValue(viewableCommentThreadIdState) ?? '';
  return (
    <RightDrawerPage>
      <RightDrawerTopBar title="" />
      <RightDrawerBody>
        <CommentThreadEditMode commentThreadId={commentThreadId} />
      </RightDrawerBody>
    </RightDrawerPage>
  );
}
