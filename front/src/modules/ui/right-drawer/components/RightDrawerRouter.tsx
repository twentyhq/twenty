import { useRecoilState } from 'recoil';

import { RightDrawerCreateActivity } from '@/activities/right-drawer/components/create/RightDrawerCreateActivity';
import { RightDrawerEditActivity } from '@/activities/right-drawer/components/edit/RightDrawerEditActivity';
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
    case RightDrawerPages.CreateActivity:
      return <RightDrawerCreateActivity />;
    case RightDrawerPages.EditActivity:
      return <RightDrawerEditActivity />;
    default:
      return <></>;
  }
}
