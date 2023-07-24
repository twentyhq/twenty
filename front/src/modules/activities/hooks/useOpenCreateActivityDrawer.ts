import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState, useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { currentUserState } from '@/auth/states/currentUserState';
import { GET_COMPANIES } from '@/companies/queries';
import { GET_PEOPLE } from '@/people/queries';
import { useSetHotkeyScope } from '@/ui/hotkey/hooks/useSetHotkeyScope';
import { useRightDrawer } from '@/ui/right-drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/right-drawer/types/RightDrawerPages';
import { ActivityType, useCreateActivityMutation } from '~/generated/graphql';

import { GET_ACTIVITIES_BY_TARGETS, GET_ACTIVITY } from '../queries';
import { commentableEntityArrayState } from '../states/commentableEntityArrayState';
import { viewableActivityIdState } from '../states/viewableActivityIdState';
import { CommentableEntity } from '../types/CommentableEntity';

export function useOpenCreateActivityDrawer() {
  const { openRightDrawer } = useRightDrawer();
  const [createActivityMutation] = useCreateActivityMutation();
  const currentUser = useRecoilValue(currentUserState);
  const setHotkeyScope = useSetHotkeyScope();

  const [, setCommentableEntityArray] = useRecoilState(
    commentableEntityArrayState,
  );
  const [, setViewableActivityId] = useRecoilState(viewableActivityIdState);

  return function openCreateActivityDrawer(
    entity: CommentableEntity,
    type: ActivityType,
  ) {
    createActivityMutation({
      variables: {
        authorId: currentUser?.id ?? '',
        activityId: v4(),
        createdAt: new Date().toISOString(),
        type: type,
        activityTargetArray: [
          {
            commentableId: entity.id,
            commentableType: entity.type,
            id: v4(),
            createdAt: new Date().toISOString(),
          },
        ],
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
        setCommentableEntityArray([entity]);
        openRightDrawer(RightDrawerPages.CreateActivity);
      },
    });
  };
}
