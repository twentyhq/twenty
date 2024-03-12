import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { activityTitleFamilyState } from '@/activities/states/activityTitleFamilyState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isDefined } from '~/utils/isDefined';

export const ActivityTitleEffect = ({ activityId }: { activityId: string }) => {
  const [activityFromStore] = useRecoilState(
    recordStoreFamilyState(activityId),
  );

  const [activityTitle, setActivityTitle] = useRecoilState(
    activityTitleFamilyState({ activityId }),
  );

  useEffect(() => {
    if (
      activityTitle === '' &&
      isDefined(activityFromStore) &&
      activityTitle !== activityFromStore.title
    ) {
      setActivityTitle(activityFromStore.title);
    }
  }, [activityFromStore, activityTitle, setActivityTitle]);

  return <></>;
};
