import { getOperationName } from '@apollo/client/utilities/graphql/getFromAST';
import { useRecoilState, useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { currentUserState } from '@/auth/states/currentUserState';
import { GET_COMPANIES } from '@/companies/queries';
import { GET_PEOPLE } from '@/people/queries';
import { useRightDrawer } from '@/ui/right-drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/right-drawer/types/RightDrawerPages';
import { selectedRowIdsSelector } from '@/ui/table/states/selectedRowIdsSelector';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import {
  ActivityType,
  CommentableType,
  useCreateActivityMutation,
} from '~/generated/graphql';

import { GET_ACTIVITIES_BY_TARGETS, GET_ACTIVITY } from '../queries';
import { commentableEntityArrayState } from '../states/commentableEntityArrayState';
import { viewableActivityIdState } from '../states/viewableActivityIdState';
import { CommentableEntity } from '../types/CommentableEntity';

export function useOpenCreateActivityDrawerForSelectedRowIds() {
  const { openRightDrawer } = useRightDrawer();
  const [createActivityMutation] = useCreateActivityMutation();
  const currentUser = useRecoilValue(currentUserState);
  const [, setViewableActivityId] = useRecoilState(viewableActivityIdState);

  const setHotkeyScope = useSetHotkeyScope();

  const [, setCommentableEntityArray] = useRecoilState(
    commentableEntityArrayState,
  );

  const selectedEntityIds = useRecoilValue(selectedRowIdsSelector);

  return function openCreateCommentDrawerForSelectedRowIds(
    entityType: CommentableType,
  ) {
    const commentableEntityArray: CommentableEntity[] = selectedEntityIds.map(
      (id) => ({
        type: entityType,
        id,
      }),
    );
    const now = new Date().toISOString();

    createActivityMutation({
      variables: {
        data: {
          id: v4(),
          createdAt: now,
          updatedAt: now,
          author: { connect: { id: currentUser?.id ?? '' } },
          type: ActivityType.Note,
          activityTargets: {
            createMany: {
              data: commentableEntityArray.map((entity) => ({
                commentableId: entity.id,
                commentableType: entity.type,
                id: v4(),
                createdAt: new Date().toISOString(),
              })),
              skipDuplicates: true,
            },
          },
        },
      },
      refetchQueries: [
        getOperationName(GET_COMPANIES) ?? '',
        getOperationName(GET_PEOPLE) ?? '',
        getOperationName(GET_ACTIVITY) ?? '',
        getOperationName(GET_ACTIVITIES_BY_TARGETS) ?? '',
      ],
      onCompleted(data) {
        setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
        setViewableActivityId(data.createOneActivity.id);
        setCommentableEntityArray(commentableEntityArray);
        openRightDrawer(RightDrawerPages.CreateActivity);
      },
    });
  };
}
