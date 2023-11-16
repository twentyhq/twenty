import { useRecoilState, useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { Activity, ActivityType } from '@/activities/types/Activity';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useCreateOneObjectRecord } from '@/object-record/hooks/useCreateOneObjectRecord';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

import { activityTargetableEntityArrayState } from '../states/activityTargetableEntityArrayState';
import { viewableActivityIdState } from '../states/viewableActivityIdState';
import { ActivityTargetableEntity } from '../types/ActivityTargetableEntity';
import { getRelationData } from '../utils/getRelationData';

export const useOpenCreateActivityDrawer = () => {
  const { openRightDrawer } = useRightDrawer();
  const { createOneObject } = useCreateOneObjectRecord({
    objectNamePlural: 'activitiesV2',
  });
  const currentUser = useRecoilValue(currentUserState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const setHotkeyScope = useSetHotkeyScope();

  const [, setActivityTargetableEntityArray] = useRecoilState(
    activityTargetableEntityArrayState,
  );
  const [, setViewableActivityId] = useRecoilState(viewableActivityIdState);

  return ({
    type,
    targetableEntities,
    assigneeId,
  }: {
    type: ActivityType;
    targetableEntities?: ActivityTargetableEntity[];
    assigneeId?: string;
  }) => {
    const now = new Date().toISOString();

    createOneObject?.({
      id: v4(),
      createdAt: now,
      updatedAt: now,
      author: { connect: { id: currentUser?.id ?? '' } },
      workspaceMemberAuthor: {
        connect: { id: currentWorkspaceMember?.id ?? '' },
      },
      assignee: { connect: { id: assigneeId ?? currentUser?.id ?? '' } },
      workspaceMemberAssignee: {
        connect: { id: currentWorkspaceMember?.id ?? '' },
      },
      type: type,
      activityTargets: {
        createMany: {
          data: targetableEntities ? getRelationData(targetableEntities) : [],
          skipDuplicates: true,
        },
      },
      onCompleted: (data: Activity) => {
        setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
        setViewableActivityId(data.id);
        setActivityTargetableEntityArray(targetableEntities ?? []);
        openRightDrawer(RightDrawerPages.CreateActivity);
      },
    });
  };
};
