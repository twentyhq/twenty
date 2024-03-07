import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { activityBodyFamilyState } from '@/activities/states/activityBodyFamilyState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isNonNullable } from '~/utils/isNonNullable';

export const ActivityBodyEffect = ({ activityId }: { activityId: string }) => {
  const [activityFromStore] = useRecoilState(
    recordStoreFamilyState(activityId),
  );

  const [activityBody, setActivityBody] = useRecoilState(
    activityBodyFamilyState({ activityId }),
  );

  useEffect(() => {
    if (
      activityBody === '' &&
      isNonNullable(activityFromStore) &&
      activityBody !== activityFromStore.body
    ) {
      setActivityBody(activityFromStore.body);
    }
  }, [activityFromStore, activityBody, setActivityBody]);

  return <></>;
};
