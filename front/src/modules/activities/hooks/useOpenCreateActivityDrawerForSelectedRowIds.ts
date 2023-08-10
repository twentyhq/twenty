import { useRecoilValue } from 'recoil';

import { selectedRowIdsSelector } from '@/ui/table/states/selectedRowIdsSelector';
import { ActivityType, CommentableType } from '~/generated/graphql';

import { CommentableEntity } from '../types/CommentableEntity';

import { useOpenCreateActivityDrawer } from './useOpenCreateActivityDrawer';

export function useOpenCreateActivityDrawerForSelectedRowIds() {
  const selectedEntityIds = useRecoilValue(selectedRowIdsSelector);

  const openCreateActivityDrawer = useOpenCreateActivityDrawer();

  return function openCreateCommentDrawerForSelectedRowIds(
    type: ActivityType,
    entityType: CommentableType,
  ) {
    const commentableEntityArray: CommentableEntity[] = selectedEntityIds.map(
      (id) => ({
        type: entityType,
        id,
      }),
    );
    openCreateActivityDrawer(type, commentableEntityArray);
  };
}
