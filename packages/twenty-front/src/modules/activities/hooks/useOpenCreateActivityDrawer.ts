import { useCallback } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilState, useRecoilValue } from 'recoil';

import { Activity, ActivityType } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

import { activityTargetableEntityArrayState } from '../states/activityTargetableEntityArrayState';
import { viewableActivityIdState } from '../states/viewableActivityIdState';
import { ActivityTargetableEntity } from '../types/ActivityTargetableEntity';
import { getTargetableEntitiesWithParents } from '../utils/getTargetableEntitiesWithParents';

export const useOpenCreateActivityDrawer = () => {
  const { openRightDrawer } = useRightDrawer();
  const { createOneRecord: createOneActivityTarget } =
    useCreateOneRecord<ActivityTarget>({
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
    });
  const { createOneRecord: createOneActivity } = useCreateOneRecord<Activity>({
    objectNameSingular: CoreObjectNameSingular.Activity,
  });
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const setHotkeyScope = useSetHotkeyScope();

  const [, setActivityTargetableEntityArray] = useRecoilState(
    activityTargetableEntityArrayState,
  );
  const [, setViewableActivityId] = useRecoilState(viewableActivityIdState);

  return useCallback(
    async ({
      type,
      targetableEntities,
      assigneeId,
    }: {
      type: ActivityType;
      targetableEntities?: ActivityTargetableEntity[];
      assigneeId?: string;
    }) => {
      const targetableEntitiesWithRelations = targetableEntities
        ? getTargetableEntitiesWithParents(targetableEntities)
        : [];

      const createdActivity = await createOneActivity?.({
        authorId: currentWorkspaceMember?.id,
        assigneeId:
          assigneeId ?? isNonEmptyString(currentWorkspaceMember?.id)
            ? currentWorkspaceMember?.id
            : undefined,
        type: type,
      });

      if (!createdActivity) {
        return;
      }

      await Promise.all(
        targetableEntitiesWithRelations.map(async (targetableEntity) => {
          await createOneActivityTarget?.({
            companyId:
              targetableEntity.type === 'Company' ? targetableEntity.id : null,
            personId:
              targetableEntity.type === 'Person' ? targetableEntity.id : null,
            activityId: createdActivity.id,
          });
        }),
      );

      setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
      setViewableActivityId(createdActivity.id);
      setActivityTargetableEntityArray(targetableEntities ?? []);
      openRightDrawer(RightDrawerPages.CreateActivity);
    },
    [
      openRightDrawer,
      setActivityTargetableEntityArray,
      setHotkeyScope,
      setViewableActivityId,
      createOneActivity,
      createOneActivityTarget,
      currentWorkspaceMember,
    ],
  );
};
