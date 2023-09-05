import { useRecoilValue } from 'recoil';

import { selectedRowIdsSelector } from '@/ui/table/states/selectors/selectedRowIdsSelector';
import { ActivityType } from '~/generated/graphql';

import {
  ActivityTargetableEntity,
  ActivityTargetableEntityType,
} from '../types/ActivityTargetableEntity';

import { useOpenCreateActivityDrawer } from './useOpenCreateActivityDrawer';

export function useOpenCreateActivityDrawerForSelectedRowIds() {
  const selectedRowIds = useRecoilValue(selectedRowIdsSelector);

  const openCreateActivityDrawer = useOpenCreateActivityDrawer();

  return function openCreateCommentDrawerForSelectedRowIds(
    type: ActivityType,
    entityType: ActivityTargetableEntityType,
  ) {
    const activityTargetableEntityArray: ActivityTargetableEntity[] =
      selectedRowIds.map((id) => ({
        type: entityType,
        id,
      }));
    openCreateActivityDrawer(type, activityTargetableEntityArray);
  };
}
