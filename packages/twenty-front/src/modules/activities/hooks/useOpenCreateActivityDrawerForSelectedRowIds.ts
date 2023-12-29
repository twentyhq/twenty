import { useRecoilCallback } from 'recoil';

import { ActivityType } from '@/activities/types/Activity';
import { useRecordTableScopedStates } from '@/object-record/record-table/hooks/internal/useRecordTableScopedStates';
import { getRecordTableScopeInjector } from '@/object-record/record-table/utils/getRecordTableScopeInjector';

import {
  ActivityTargetableEntity,
  ActivityTargetableEntityType,
} from '../types/ActivityTargetableEntity';

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
        entityType: ActivityTargetableEntityType,
        relatedEntities?: ActivityTargetableEntity[],
      ) => {
        const selectedRowIds =
          injectSelectorSnapshotValueWithRecordTableScopeId(
            snapshot,
            selectedRowIdsScopeInjector,
          );

        let activityTargetableEntityArray: ActivityTargetableEntity[] =
          selectedRowIds.map((id: string) => ({
            type: entityType,
            id,
          }));
        if (relatedEntities) {
          activityTargetableEntityArray =
            activityTargetableEntityArray.concat(relatedEntities);
        }
        openCreateActivityDrawer({
          type,
          targetableEntities: activityTargetableEntityArray,
        });
      },
    [
      injectSelectorSnapshotValueWithRecordTableScopeId,
      openCreateActivityDrawer,
      selectedRowIdsScopeInjector,
    ],
  );
};
