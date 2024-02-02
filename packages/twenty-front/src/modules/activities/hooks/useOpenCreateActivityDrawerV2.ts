import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilState, useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { useAttachRelationSourceRecordToItsRelationTargetRecordsAndViceVersaInCache } from '@/activities/hooks/useAttachRelationSourceRecordToItsRelationTargetRecordsAndViceVersaInCache';
import { useInjectIntoActivityTargetInlineCellCache } from '@/activities/inline-cell/hooks/useInjectIntoActivityTargetInlineCellCache';
import { isCreatingActivityState } from '@/activities/states/isCreatingActivityState';
import { useInjectIntoTimelineActivitiesQueryAfterDrawerMount } from '@/activities/timeline/hooks/useInjectIntoTimelineActivitiesQueryAfterDrawerMount';
import { Activity, ActivityType } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { getActivityTargetsToCreateFromTargetableObjects } from '@/activities/utils/getActivityTargetsToCreateFromTargetableObjects';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateManyRecordsInCache } from '@/object-record/hooks/useCreateManyRecordsInCache';
import { useCreateOneRecordInCache } from '@/object-record/hooks/useCreateOneRecordInCache';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
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

  const [, setIsCreatingActivity] = useRecoilState(isCreatingActivityState);

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
    depth: 3,
  });

  const setHotkeyScope = useSetHotkeyScope();

  const [, setActivityTargetableEntityArray] = useRecoilState(
    activityTargetableEntityArrayState,
  );
  const [, setViewableActivityId] = useRecoilState(viewableActivityIdState);

  const { injectIntoTimelineActivitiesQueryAfterDrawerMount } =
    useInjectIntoTimelineActivitiesQueryAfterDrawerMount({
      targetableObject,
    });

  const { injectIntoActivityTargetInlineCellCache } =
    useInjectIntoActivityTargetInlineCellCache();

  const {
    attachRelationSourceRecordToItsRelationTargetRecordsAndViceVersaInCache,
  } =
    useAttachRelationSourceRecordToItsRelationTargetRecordsAndViceVersaInCache();

  const openCreateActivityDrawer = async ({
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

    injectIntoTimelineActivitiesQueryAfterDrawerMount({
      activityToInject: createdActivityInCache,
      activityTargetsToInject: createdActivityTargetsInCache,
    });

    injectIntoActivityTargetInlineCellCache({
      activityId,
      activityTargetsToInject: createdActivityTargetsInCache,
    });

    attachRelationSourceRecordToItsRelationTargetRecordsAndViceVersaInCache({
      relationSourceRecord: createdActivityInCache,
      relationSourceFieldName: 'activityTargets',
      relationSourceNameSingular: CoreObjectNameSingular.Activity,
      relationTargetFieldName: 'activity',
      relationTargetNameSingular: CoreObjectNameSingular.ActivityTarget,
      relationTargetRecords: createdActivityTargetsInCache,
    });

    setIsCreatingActivity(true);
    setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
    setViewableActivityId(activityId);
    setActivityTargetableEntityArray(targetableObjects ?? []);
    openRightDrawer(RightDrawerPages.CreateActivity);
  };

  return openCreateActivityDrawer;
};
