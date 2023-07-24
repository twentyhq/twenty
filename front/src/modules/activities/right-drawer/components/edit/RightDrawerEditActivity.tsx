import { useRecoilValue } from 'recoil';

import { viewableActivityIdState } from '@/activities/states/viewableActivityIdState';
import { RightDrawerBody } from '@/ui/right-drawer/components/RightDrawerBody';
import { RightDrawerPage } from '@/ui/right-drawer/components/RightDrawerPage';
import { RightDrawerTopBar } from '@/ui/right-drawer/components/RightDrawerTopBar';

import { Activity } from '../Activity';

export function RightDrawerEditActivity() {
  const activityId = useRecoilValue(viewableActivityIdState);

  return (
    <RightDrawerPage>
      <RightDrawerTopBar />
      <RightDrawerBody>
        {activityId && <Activity activityId={activityId} />}
      </RightDrawerBody>
    </RightDrawerPage>
  );
}
