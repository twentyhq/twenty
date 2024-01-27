import { useRecoilCallback } from 'recoil';

import { ActivityType } from '@/activities/types/Activity';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

import { ActivityTargetableObject } from '../types/ActivityTargetableEntity';

import { useOpenCreateActivityDrawer } from './useOpenCreateActivityDrawer';

export const useOpenCreateActivityDrawerForSelectedRowIds = (
  recordTableId: string,
) => {
  const openCreateActivityDrawer = useOpenCreateActivityDrawer();

  const { getSelectedRowIdsSelector } = useRecordTableStates(recordTableId);

  return useRecoilCallback(
    ({ snapshot }) =>
      (
        type: ActivityType,
        objectNameSingular: string,
        relatedEntities?: ActivityTargetableObject[],
      ) => {
        const selectedRowIds = getSnapshotValue(
          snapshot,
          getSelectedRowIdsSelector(),
        );

        let activityTargetableEntityArray: ActivityTargetableObject[] =
          selectedRowIds.map((id: string) => ({
            type: 'Custom',
            targetObjectNameSingular: objectNameSingular,
            id,
          }));

        if (relatedEntities) {
          activityTargetableEntityArray =
            activityTargetableEntityArray.concat(relatedEntities);
        }

        openCreateActivityDrawer({
          type,
          targetableObjects: activityTargetableEntityArray,
        });
      },
    [openCreateActivityDrawer, getSelectedRowIdsSelector],
  );
};
