import { useRecoilState } from 'recoil';

import { RightDrawerCreateCommentThread } from '@/comments/components/RightDrawerCreateCommentThread';
import { RightDrawerEditCommentThread } from '@/comments/components/RightDrawerEditCommentThread';
import { RightDrawerTimeline } from '@/comments/components/RightDrawerTimeline';
import { isDefined } from '@/utils/type-guards/isDefined';

import { rightDrawerPageState } from '../states/rightDrawerPageState';

export function RightDrawerRouter() {
  const [rightDrawerPage] = useRecoilState(rightDrawerPageState);

  if (!isDefined(rightDrawerPage)) {
    return <></>;
  }

  return rightDrawerPage === 'comments' ? (
    <RightDrawerTimeline />
  ) : rightDrawerPage === 'create-comment-thread' ? (
    <RightDrawerCreateCommentThread />
  ) : rightDrawerPage === 'edit-comment-thread' ? (
    <RightDrawerEditCommentThread />
  ) : (
    <></>
  );
}
