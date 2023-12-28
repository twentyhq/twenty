import { useRecoilCallback } from 'recoil';

import { ActivityType } from '@/activities/types/Activity';
import { selectedRowIdsSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsSelector';

import { ActivityTargetableObject } from '../types/ActivityTargetableEntity';

import { useOpenCreateActivityDrawer } from './useOpenCreateActivityDrawer';

export const useOpenCreateActivityDrawerForSelectedRowIds = () => {
  const openCreateActivityDrawer = useOpenCreateActivityDrawer();

  return useRecoilCallback(
    ({ snapshot }) =>
      (
        type: ActivityType,
        objectNameSingular: string,
        relatedEntities?: ActivityTargetableObject[],
      ) => {
        const selectedRowIds = snapshot
          .getLoadable(selectedRowIdsSelector)
          .getValue();

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
    [openCreateActivityDrawer],
  );
};
