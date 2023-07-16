import { useRecoilState } from 'recoil';

import { RightDrawerCreateCommentThread } from '@/activities/right-drawer/components/create/RightDrawerCreateCommentThread';
import { RightDrawerEditCommentThread } from '@/activities/right-drawer/components/edit/RightDrawerEditCommentThread';
import { RightDrawerTimeline } from '@/activities/right-drawer/components/RightDrawerTimeline';
import { isDefined } from '~/utils/isDefined';

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
