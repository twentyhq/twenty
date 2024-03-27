import { useRecoilCallback } from 'recoil';
import { getSnapshotValue } from 'twenty-ui';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { ActivityType } from '@/activities/types/Activity';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { isDefined } from '~/utils/isDefined';

import { ActivityTargetableObject } from '../types/ActivityTargetableEntity';

export const useOpenCreateActivityDrawerForSelectedRowIds = (
  recordTableId: string,
) => {
  const openCreateActivityDrawer = useOpenCreateActivityDrawer();

  const { selectedRowIdsSelector } = useRecordTableStates(recordTableId);

  return useRecoilCallback(
    ({ snapshot }) =>
      (
        type: ActivityType,
        objectNameSingular: string,
        relatedEntities?: ActivityTargetableObject[],
      ) => {
        const selectedRowIds = getSnapshotValue(
          snapshot,
          selectedRowIdsSelector(),
        );

        let activityTargetableObjectArray: ActivityTargetableObject[] =
          selectedRowIds
            .map((recordId: string) => {
              const targetObjectRecord = getSnapshotValue(
                snapshot,
                recordStoreFamilyState(recordId),
              );

              if (!targetObjectRecord) {
                return null;
              }

              return {
                type: 'Custom',
                targetObjectNameSingular: objectNameSingular,
                id: recordId,
                targetObjectRecord,
              };
            })
            .filter(isDefined);

        if (isDefined(relatedEntities)) {
          activityTargetableObjectArray =
            activityTargetableObjectArray.concat(relatedEntities);
        }

        openCreateActivityDrawer({
          type,
          targetableObjects: activityTargetableObjectArray,
        });
      },
    [selectedRowIdsSelector, openCreateActivityDrawer],
  );
};
