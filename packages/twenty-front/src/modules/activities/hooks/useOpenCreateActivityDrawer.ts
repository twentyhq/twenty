import { useCallback } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilState, useRecoilValue } from 'recoil';

import { Activity, ActivityType } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { getTargetableObjectFilterFieldName } from '@/activities/utils/getTargetObjectFilterFieldName';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

import { activityTargetableEntityArrayState } from '../states/activityTargetableEntityArrayState';
import { viewableActivityIdState } from '../states/viewableActivityIdState';
import { ActivityTargetableObject } from '../types/ActivityTargetableEntity';
import { flattenTargetableObjectsAndTheirRelatedTargetableObjects } from '../utils/flattenTargetableObjectsAndTheirRelatedTargetableObjects';

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
      targetableObjects,
      assigneeId,
    }: {
      type: ActivityType;
      targetableObjects?: ActivityTargetableObject[];
      assigneeId?: string;
    }) => {
      const flattenedTargetableObjects = targetableObjects
        ? flattenTargetableObjectsAndTheirRelatedTargetableObjects(
            targetableObjects,
          )
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
        flattenedTargetableObjects.map((targetableObject) => {
          const targetableObjectFieldName = getTargetableObjectFilterFieldName({
            targetableObject,
          });

          return createOneActivityTarget?.({
            [targetableObjectFieldName]: targetableObject.id,
            activityId: createdActivity.id,
          });
        }),
      );

      setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
      setViewableActivityId(createdActivity.id);
      setActivityTargetableEntityArray(targetableObjects ?? []);
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
