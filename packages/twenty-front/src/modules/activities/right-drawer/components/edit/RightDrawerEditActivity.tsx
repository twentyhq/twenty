import { useRecoilValue } from 'recoil';

import { viewableActivityIdState } from '@/activities/states/viewableActivityIdState';

import { RightDrawerActivity } from '../RightDrawerActivity';

export const RightDrawerEditActivity = () => {
  const viewableActivityId = useRecoilValue(viewableActivityIdState);

  return (
    <>
      {viewableActivityId && (
        <RightDrawerActivity activityId={viewableActivityId} />
      )}
    </>
  );
};
