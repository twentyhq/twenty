import { useEffect } from 'react';
import { useRecoilCallback } from 'recoil';

import { activityTargetObjectRecordComponentFamilyState } from '@/activities/inline-cell/states/activityTargetObjectRecordComponentFamilyState';
import { ActivityTargetWithTargetRecord } from '@/activities/types/ActivityTargetObject';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const ActivityTargetObjectRecordEffect = ({
  activityTargetWithTargetRecords,
  recordPickerInstanceId,
}: {
  activityTargetWithTargetRecords: ActivityTargetWithTargetRecord[];
  recordPickerInstanceId: string;
}) => {
  const activityTargetObjectRecordFamilyState =
    useRecoilComponentCallbackStateV2(
      activityTargetObjectRecordComponentFamilyState,
      recordPickerInstanceId,
    );

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
