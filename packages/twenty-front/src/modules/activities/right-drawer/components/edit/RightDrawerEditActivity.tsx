import { useRecoilValue } from 'recoil';

import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';

import { RightDrawerActivity } from '../RightDrawerActivity';

export const RightDrawerEditActivity = () => {
  const viewableRecordId = useRecoilValue(viewableRecordIdState);

  return (
    <>
      {viewableRecordId && (
        <RightDrawerActivity activityId={viewableRecordId} />
      )}
    </>
  );
};
