import { useRecoilState, useRecoilValue } from 'recoil';

import { Activity, ActivityType } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
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
  const { createOneObject: createOneActivityTarget } =
    useCreateOneObjectRecord<ActivityTarget>({
      objectNameSingular: 'activityTargetV2',
    });
  const { createOneObject: createOneActivity } =
    useCreateOneObjectRecord<Activity>({
      objectNameSingular: 'activityV2',
    });
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const setHotkeyScope = useSetHotkeyScope();

  const [, setActivityTargetableEntityArray] = useRecoilState(
    activityTargetableEntityArrayState,
  );
  const [, setViewableActivityId] = useRecoilState(viewableActivityIdState);

  return async ({
    type,
    targetableEntities,
    assigneeId,
  }: {
    type: ActivityType;
    targetableEntities?: ActivityTargetableEntity[];
    assigneeId?: string;
  }) => {
    await createOneActivityTarget?.({});
    createOneActivity?.({
      authorId: { eq: currentWorkspaceMember?.id },
      assigneeId: { eq: assigneeId ?? currentWorkspaceMember?.id },
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
