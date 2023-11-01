import { useRecoilCallback } from 'recoil';

import { selectedRowIdsSelector } from '@/ui/object/record-table/states/selectors/selectedRowIdsSelector';
import { ActivityType } from '~/generated/graphql';

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
          snapshot.getLoadable(selectedRowIdsSelector).getValue(),
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
  );
};
