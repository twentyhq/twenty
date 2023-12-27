import { useRecoilCallback } from 'recoil';

import { ActivityType } from '@/activities/types/Activity';
import { selectedRowIdsScopedSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsScopedSelector';

import {
  ActivityTargetableEntity,
  ActivityTargetableEntityType,
} from '../types/ActivityTargetableEntity';

import { useOpenCreateActivityDrawer } from './useOpenCreateActivityDrawer';

export const useOpenCreateActivityDrawerForSelectedRowIds = () => {
  const openCreateActivityDrawer = useOpenCreateActivityDrawer();

  return useRecoilCallback(
    ({ snapshot }) =>
      (
        type: ActivityType,
        entityType: ActivityTargetableEntityType,
        relatedEntities?: ActivityTargetableEntity[],
      ) => {
        const selectedRowIds = Object.keys(
          snapshot.getLoadable(selectedRowIdsScopedSelector).getValue(),
        );
        let activityTargetableEntityArray: ActivityTargetableEntity[] =
          selectedRowIds.map((id) => ({
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
    [openCreateActivityDrawer],
  );
};
