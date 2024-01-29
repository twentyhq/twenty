import { useRecoilCallback } from 'recoil';

import { ActivityType } from '@/activities/types/Activity';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { isDefined } from '~/utils/isDefined';

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

        if (relatedEntities) {
          activityTargetableObjectArray =
            activityTargetableObjectArray.concat(relatedEntities);
        }

        openCreateActivityDrawer({
          type,
          targetableObjects: activityTargetableObjectArray,
        });
      },
    [openCreateActivityDrawer, getSelectedRowIdsSelector],
  );
};
