import { useCallback } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilState, useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { useActivityTargets } from '@/activities/hooks/useActivityTargets';
import { useModifyActivityOnActivityTargetsCache } from '@/activities/hooks/useModifyActivityOnActivityTargetCache';
import { useModifyActivityTargetsOnActivityCache } from '@/activities/hooks/useModifyActivityTargetsOnActivityCache';
import { useWriteActivityTargetsInCache } from '@/activities/hooks/useWriteActivityTargetsInCache';
import { useInjectIntoActivityTargetInlineCellCache } from '@/activities/inline-cell/hooks/useInjectIntoActivityTargetInlineCellCache';
import { useInjectIntoTimelineActivitiesQuery } from '@/activities/timeline/hooks/useInjectIntoTimelineActivitiesQuery';
import { Activity, ActivityType } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { getActivityTargetsToCreateFromTargetableObjects } from '@/activities/utils/getActivityTargetsToCreateFromTargetableObjects';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateManyRecordsInCache } from '@/object-record/hooks/useCreateManyRecordsInCache';
import { useCreateOneRecordInCache } from '@/object-record/hooks/useCreateOneRecordInCache';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { mapToRecordId } from '@/object-record/utils/mapToObjectId';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

import { activityTargetableEntityArrayState } from '../states/activityTargetableEntityArrayState';
import { viewableActivityIdState } from '../states/viewableActivityIdState';
import { ActivityTargetableObject } from '../types/ActivityTargetableEntity';

export const useOpenCreateActivityDrawerV2 = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  const { openRightDrawer } = useRightDrawer();

  const { createManyRecordsInCache: createManyActivityTargetsInCache } =
    useCreateManyRecordsInCache<ActivityTarget>({
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
    });

  const { createOneRecordInCache: createOneActivityInCache } =
    useCreateOneRecordInCache<Activity>({
      objectNameSingular: CoreObjectNameSingular.Activity,
    });

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { record: workspaceMemberRecord } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    objectRecordId: currentWorkspaceMember?.id,
  });

  const setHotkeyScope = useSetHotkeyScope();

  const [, setActivityTargetableEntityArray] = useRecoilState(
    activityTargetableEntityArrayState,
  );
  const [, setViewableActivityId] = useRecoilState(viewableActivityIdState);

  const { activityTargets } = useActivityTargets({
    targetableObject,
  });

  const { injectIntoTimelineActivitiesNextQuery } =
    useInjectIntoTimelineActivitiesQuery();

  const { injectIntoActivityTargetInlineCellCache } =
    useInjectIntoActivityTargetInlineCellCache();

  const { injectIntoUseActivityTargets } = useWriteActivityTargetsInCache();

  const { modifyActivityTargetsOnActivityCache } =
    useModifyActivityTargetsOnActivityCache();

  const { modifyActivityOnActivityTargetsCache } =
    useModifyActivityOnActivityTargetsCache();

  return useCallback(
    async ({
      type,
      targetableObjects,
      assigneeId,
    }: {
      type: ActivityType;
      targetableObjects: ActivityTargetableObject[];
      assigneeId?: string;
    }) => {
      const activityId = v4();

      const createdActivityInCache = await createOneActivityInCache({
        id: activityId,
        author: workspaceMemberRecord,
        authorId: workspaceMemberRecord?.id,
        assignee: !assigneeId ? workspaceMemberRecord : undefined,
        assigneeId:
          assigneeId ?? isNonEmptyString(workspaceMemberRecord?.id)
            ? workspaceMemberRecord?.id
            : undefined,
        type: type,
      });

      if (!createdActivityInCache) {
        return;
      }

      const activityTargetsToCreate =
        getActivityTargetsToCreateFromTargetableObjects({
          activityId,
          targetableObjects,
        });

      const createdActivityTargetsInCache =
        await createManyActivityTargetsInCache(activityTargetsToCreate);

      injectIntoUseActivityTargets({
        targetableObject,
        activityTargetsToInject: createdActivityTargetsInCache,
      });

      injectIntoTimelineActivitiesNextQuery({
        activityTargets,
        activityToInject: createdActivityInCache,
      });

      injectIntoActivityTargetInlineCellCache({
        activityId,
        activityTargetsToInject: createdActivityTargetsInCache,
      });

      modifyActivityTargetsOnActivityCache({
        activityId,
        activityTargets: createdActivityTargetsInCache,
      });

      modifyActivityOnActivityTargetsCache({
        activityTargetIds: createdActivityTargetsInCache.map(mapToRecordId),
        activity: createdActivityInCache,
      });

      setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
      setViewableActivityId(activityId);
      setActivityTargetableEntityArray(targetableObjects ?? []);
      openRightDrawer(RightDrawerPages.CreateActivity);
    },
    [
      openRightDrawer,
      setActivityTargetableEntityArray,
      createManyActivityTargetsInCache,
      setHotkeyScope,
      setViewableActivityId,
      createOneActivityInCache,
      workspaceMemberRecord,
      activityTargets,
      targetableObject,
      injectIntoTimelineActivitiesNextQuery,
      injectIntoActivityTargetInlineCellCache,
      injectIntoUseActivityTargets,
      modifyActivityTargetsOnActivityCache,
      modifyActivityOnActivityTargetsCache,
    ],
  );
};
