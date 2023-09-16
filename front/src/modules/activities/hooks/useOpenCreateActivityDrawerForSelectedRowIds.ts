import { useRecoilValue } from 'recoil';

import { selectedRowIdsSelector } from '@/ui/table/states/selectors/selectedRowIdsSelector';
import { ActivityType } from '~/generated/graphql';

import {
  ActivityTargetableEntity,
  ActivityTargetableEntityType,
} from '../types/ActivityTargetableEntity';

import { useOpenCreateActivityDrawer } from './useOpenCreateActivityDrawer';

export const useOpenCreateActivityDrawerForSelectedRowIds = () => {
  const selectedRowIds = useRecoilValue(selectedRowIdsSelector);

  const openCreateActivityDrawer = useOpenCreateActivityDrawer();

  return (type: ActivityType, entityType: ActivityTargetableEntityType) => {
    const activityTargetableEntityArray: ActivityTargetableEntity[] =
      selectedRowIds.map((id) => ({
        type: entityType,
        id,
      }));
    openCreateActivityDrawer({
      type,
      targetableEntities: activityTargetableEntityArray,
    });
  };
};
