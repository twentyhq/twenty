import { useCallback } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilState, useRecoilValue } from 'recoil';

import { Activity, ActivityType } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getTargetObjectFilterFieldName';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { isNonEmptyArray } from '~/utils/isNonEmptyArray';

import { activityTargetableEntityArrayState } from '../states/activityTargetableEntityArrayState';
import { viewableActivityIdState } from '../states/viewableActivityIdState';
import { ActivityTargetableObject } from '../types/ActivityTargetableEntity';
import { flattenTargetableObjectsAndTheirRelatedTargetableObjects } from '../utils/flattenTargetableObjectsAndTheirRelatedTargetableObjects';

export const useOpenCreateActivityDrawer = () => {
  const { openRightDrawer } = useRightDrawer();
  const { createManyRecords: createManyActivityTargets } =
    useCreateManyRecords<ActivityTarget>({
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

      const activityTargetsToCreate = flattenedTargetableObjects.map(
        (targetableObject) => {
          const targetableObjectFieldIdName =
            getActivityTargetObjectFieldIdName({
              nameSingular: targetableObject.targetObjectNameSingular,
            });

          return {
            [targetableObjectFieldIdName]: targetableObject.id,
            activityId: createdActivity.id,
          };
        },
      );

      if (isNonEmptyArray(activityTargetsToCreate)) {
        await createManyActivityTargets(activityTargetsToCreate);
      }

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
      createManyActivityTargets,
      currentWorkspaceMember,
    ],
  );
};
