import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { useAttachRelationInBothDirections } from '@/activities/hooks/useAttachRelationInBothDirections';
import { useInjectIntoActivityTargetInlineCellCache } from '@/activities/inline-cell/hooks/useInjectIntoActivityTargetInlineCellCache';
import { useInjectIntoTimelineActivitiesQueryAfterDrawerMount } from '@/activities/timeline/hooks/useInjectIntoTimelineActivitiesQueryAfterDrawerMount';
import { Activity, ActivityType } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetsToCreateFromTargetableObjects } from '@/activities/utils/getActivityTargetsToCreateFromTargetableObjects';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateManyRecordsInCache } from '@/object-record/hooks/useCreateManyRecordsInCache';
import { useCreateOneRecordInCache } from '@/object-record/hooks/useCreateOneRecordInCache';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';

export const useCreateActivityInCache = () => {
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

  const { injectIntoTimelineActivitiesQueryAfterDrawerMount } =
    useInjectIntoTimelineActivitiesQueryAfterDrawerMount();

  const { injectIntoActivityTargetInlineCellCache } =
    useInjectIntoActivityTargetInlineCellCache();

  const {
    attachRelationInBothDirections:
      attachRelationSourceRecordToItsRelationTargetRecordsAndViceVersaInCache,
  } = useAttachRelationInBothDirections();

  const createActivityInCache = ({
    type,
    targetableObjects,
    timelineTargetableObject,
    assigneeId,
  }: {
    type: ActivityType;
    targetableObjects: ActivityTargetableObject[];
    timelineTargetableObject: ActivityTargetableObject;
    assigneeId?: string;
  }) => {
    const activityId = v4();

    const createdActivityInCache = createOneActivityInCache({
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

    const activityTargetsToCreate =
      getActivityTargetsToCreateFromTargetableObjects({
        activityId,
        targetableObjects,
      });

    const createdActivityTargetsInCache = createManyActivityTargetsInCache(
      activityTargetsToCreate,
    );

    injectIntoTimelineActivitiesQueryAfterDrawerMount({
      activityToInject: createdActivityInCache,
      activityTargetsToInject: createdActivityTargetsInCache,
      timelineTargetableObject,
    });

    injectIntoActivityTargetInlineCellCache({
      activityId,
      activityTargetsToInject: createdActivityTargetsInCache,
    });

    attachRelationSourceRecordToItsRelationTargetRecordsAndViceVersaInCache({
      sourceRecord: createdActivityInCache,
      fieldNameOnSourceRecord: 'activityTargets',
      sourceObjectNameSingular: CoreObjectNameSingular.Activity,
      fieldNameOnTargetRecord: 'activity',
      targetObjectNameSingular: CoreObjectNameSingular.ActivityTarget,
      targetRecords: createdActivityTargetsInCache,
    });

    return {
      createdActivityInCache: {
        ...createdActivityInCache,
        activityTargets: createdActivityTargetsInCache,
      },
      createdActivityTargetsInCache,
    };
  };

  return {
    createActivityInCache,
  };
};
