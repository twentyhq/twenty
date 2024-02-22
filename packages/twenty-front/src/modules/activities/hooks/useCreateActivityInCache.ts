import { useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { useAttachRelationInBothDirections } from '@/activities/hooks/useAttachRelationInBothDirections';
import { useInjectIntoActivityTargetInlineCellCache } from '@/activities/inline-cell/hooks/useInjectIntoActivityTargetInlineCellCache';
import { Activity, ActivityType } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetsToCreateFromTargetableObjects } from '@/activities/utils/getActivityTargetsToCreateFromTargetableObjects';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateManyRecordsInCache } from '@/object-record/hooks/useCreateManyRecordsInCache';
import { useCreateOneRecordInCache } from '@/object-record/hooks/useCreateOneRecordInCache';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

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

  const { record: currentWorkspaceMemberRecord } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    objectRecordId: currentWorkspaceMember?.id,
    depth: 3,
  });

  const { injectIntoActivityTargetInlineCellCache } =
    useInjectIntoActivityTargetInlineCellCache();

  const { attachRelationInBothDirections } =
    useAttachRelationInBothDirections();

  const createActivityInCache = ({
    type,
    targetableObjects,
    customAssignee,
  }: {
    type: ActivityType;
    targetableObjects: ActivityTargetableObject[];
    customAssignee?: WorkspaceMember;
  }) => {
    const activityId = v4();

    const createdActivityInCache = createOneActivityInCache({
      id: activityId,
      author: currentWorkspaceMemberRecord,
      authorId: currentWorkspaceMemberRecord?.id,
      assignee: customAssignee ?? currentWorkspaceMemberRecord,
      assigneeId: customAssignee?.id ?? currentWorkspaceMemberRecord?.id,
      type,
    });

    const activityTargetsToCreate =
      getActivityTargetsToCreateFromTargetableObjects({
        activityId,
        targetableObjects,
      });

    const createdActivityTargetsInCache = createManyActivityTargetsInCache(
      activityTargetsToCreate,
    );

    injectIntoActivityTargetInlineCellCache({
      activityId,
      activityTargetsToInject: createdActivityTargetsInCache,
    });

    attachRelationInBothDirections({
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
