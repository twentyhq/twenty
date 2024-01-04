import { useRecoilCallback } from 'recoil';

import { ActivityType } from '@/activities/types/Activity';
import { useRecordTableScopedStates } from '@/object-record/record-table/hooks/internal/useRecordTableScopedStates';
import { getRecordTableScopeInjector } from '@/object-record/record-table/utils/getRecordTableScopeInjector';

import { ActivityTargetableObject } from '../types/ActivityTargetableEntity';

import { useOpenCreateActivityDrawer } from './useOpenCreateActivityDrawer';

export const useOpenCreateActivityDrawerForSelectedRowIds = (
  recordTableScopeId: string,
) => {
  const openCreateActivityDrawer = useOpenCreateActivityDrawer();

  const { selectedRowIdsScopeInjector } = getRecordTableScopeInjector();

  const { injectSelectorSnapshotValueWithRecordTableScopeId } =
    useRecordTableScopedStates(recordTableScopeId);

  return useRecoilCallback(
    ({ snapshot }) =>
      (
        type: ActivityType,
        objectNameSingular: string,
        relatedEntities?: ActivityTargetableObject[],
      ) => {
        const selectedRowIds =
          injectSelectorSnapshotValueWithRecordTableScopeId(
            snapshot,
            selectedRowIdsScopeInjector,
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
    [
      injectSelectorSnapshotValueWithRecordTableScopeId,
      openCreateActivityDrawer,
      selectedRowIdsScopeInjector,
    ],
  );
};
