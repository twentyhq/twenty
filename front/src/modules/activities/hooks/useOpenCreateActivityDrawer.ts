import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState, useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { currentUserState } from '@/auth/states/currentUserState';
import { GET_COMPANIES } from '@/companies/queries';
import { GET_PEOPLE } from '@/people/queries';
import { useRightDrawer } from '@/ui/right-drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/right-drawer/types/RightDrawerPages';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { ActivityType, useCreateActivityMutation } from '~/generated/graphql';

import {
  GET_ACTIVITIES,
  GET_ACTIVITIES_BY_TARGETS,
  GET_ACTIVITY,
} from '../queries';
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
    type: ActivityType,
    entity?: CommentableEntity,
  ) {
    const now = new Date().toISOString();

    return createActivityMutation({
      variables: {
        data: {
          id: v4(),
          createdAt: now,
          updatedAt: now,
          author: { connect: { id: currentUser?.id ?? '' } },
          assignee: { connect: { id: currentUser?.id ?? '' } },
          type: type,
          activityTargets: {
            createMany: {
              data: entity
                ? [
                    {
                      commentableId: entity.id,
                      commentableType: entity.type,
                      id: v4(),
                      createdAt: now,
                    },
                  ]
                : [],
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
        getOperationName(GET_ACTIVITIES) ?? '',
      ],
      onCompleted(data) {
        setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
        setViewableActivityId(data.createOneActivity.id);
        setCommentableEntityArray(entity ? [entity] : []);
        openRightDrawer(RightDrawerPages.CreateActivity);
      },
    });
  };
}
