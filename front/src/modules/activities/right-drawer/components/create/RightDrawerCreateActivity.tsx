import { useRecoilValue } from 'recoil';

import { viewableActivityIdState } from '@/activities/states/viewableActivityIdState';
import { RightDrawerBody } from '@/ui/right-drawer/components/RightDrawerBody';
import { RightDrawerPage } from '@/ui/right-drawer/components/RightDrawerPage';
import { RightDrawerTopBar } from '@/ui/right-drawer/components/RightDrawerTopBar';

import { RightDrawerActivity } from '../RightDrawerActivity';

export function RightDrawerCreateActivity() {
  const activityId = useRecoilValue(viewableActivityIdState);

  return (
    <RightDrawerPage>
      <RightDrawerTopBar />
      <RightDrawerBody>
        {activityId && (
          <RightDrawerActivity
            activityId={activityId}
            showComment={false}
            autoFillTitle={true}
          />
        )}
      </RightDrawerBody>
    </RightDrawerPage>
  );
}
