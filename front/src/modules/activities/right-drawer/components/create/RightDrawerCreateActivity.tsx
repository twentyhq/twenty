import { useRecoilValue } from 'recoil';

import { viewableActivityIdState } from '@/activities/states/viewableActivityIdState';

import { RightDrawerActivity } from '../RightDrawerActivity';

export const RightDrawerCreateActivity = () => {
  const viewableActivityId = useRecoilValue(viewableActivityIdState);

  return (
    <>
      <RightDrawerActivity
        activityId={viewableActivityId ?? undefined}
        showComment={false}
        autoFillTitle={true}
      />
    </>
  );
};
