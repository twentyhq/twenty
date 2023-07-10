import { useRecoilState } from 'recoil';

import { RightDrawerCreateCommentThread } from '@/comments/components/right-drawer/create/RightDrawerCreateCommentThread';
import { RightDrawerEditCommentThread } from '@/comments/components/right-drawer/edit/RightDrawerEditCommentThread';
import { RightDrawerTimeline } from '@/comments/components/right-drawer/RightDrawerTimeline';
import { isDefined } from '@/utils/type-guards/isDefined';

import { rightDrawerPageState } from '../states/rightDrawerPageState';
import { RightDrawerPages } from '../types/RightDrawerPages';

export function RightDrawerRouter() {
  const [rightDrawerPage] = useRecoilState(rightDrawerPageState);

  if (!isDefined(rightDrawerPage)) {
    return <></>;
  }

  switch (rightDrawerPage) {
    case RightDrawerPages.Timeline:
      return <RightDrawerTimeline />;
    case RightDrawerPages.CreateCommentThread:
      return <RightDrawerCreateCommentThread />;
    case RightDrawerPages.EditCommentThread:
      return <RightDrawerEditCommentThread />;
    default:
      return <></>;
  }
}
