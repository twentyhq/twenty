import { useEffect } from 'react';
import { useRecoilCallback } from 'recoil';

import { ActivityTargetWithTargetRecord } from '@/activities/types/ActivityTargetObject';
import { activityTargetObjectRecordFamilyState } from '@/object-record/record-field/states/activityTargetObjectRecordFamilyState';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const ActivityTargetObjectRecordEffect = ({
  activityTargetWithTargetRecords,
}: {
  activityTargetWithTargetRecords: ActivityTargetWithTargetRecord[];
}) => {
  const updateActivityTargets = useRecoilCallback(
    ({ snapshot, set }) =>
      (newActivityTargets: ActivityTargetWithTargetRecord[]) => {
        for (const newActivityTarget of newActivityTargets) {
          const objectRecordId = newActivityTarget.targetObject.id;
          const record = snapshot
            .getLoadable(activityTargetObjectRecordFamilyState(objectRecordId))
            .getValue();

          if (
            !isDeeplyEqual(
              record.activityTargetId,
              newActivityTarget.activityTarget.id,
            )
          ) {
            set(activityTargetObjectRecordFamilyState(objectRecordId), {
              activityTargetId: newActivityTarget.activityTarget.id,
            });
          }
        }
      },
    [],
  );

  useEffect(() => {
    updateActivityTargets(activityTargetWithTargetRecords);
  }, [activityTargetWithTargetRecords, updateActivityTargets]);

  return <></>;
};
