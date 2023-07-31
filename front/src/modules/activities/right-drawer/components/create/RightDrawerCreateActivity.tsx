import { useRecoilValue } from 'recoil';

import { viewableActivityIdState } from '@/activities/states/viewableActivityIdState';

import { RightDrawerActivity } from '../RightDrawerActivity';

export function RightDrawerCreateActivity() {
  const activityId = useRecoilValue(viewableActivityIdState);

  return (
    <>
      {activityId && (
        <RightDrawerActivity
          activityId={activityId}
          showComment={false}
          autoFillTitle={true}
        />
      )}
    </>
  );
}
