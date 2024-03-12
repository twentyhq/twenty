import { useRecoilCallback, useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { useAttachRelationInBothDirections } from '@/activities/hooks/useAttachRelationInBothDirections';
import { useInjectIntoActivityTargetInlineCellCache } from '@/activities/inline-cell/hooks/useInjectIntoActivityTargetInlineCellCache';
import { Activity, ActivityType } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { makeActivityTargetsToCreateFromTargetableObjects } from '@/activities/utils/getActivityTargetsToCreateFromTargetableObjects';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateManyRecordsInCache } from '@/object-record/hooks/useCreateManyRecordsInCache';
import { useCreateOneRecordInCache } from '@/object-record/hooks/useCreateOneRecordInCache';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { isDefined } from '~/utils/isDefined';

export const useCreateActivityInCache = () => {
  const { createManyRecordsInCache: createManyActivityTargetsInCache } =
    useCreateManyRecordsInCache<ActivityTarget>({
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
    });

  const { createOneRecordInCache: createOneActivityInCache } =
    useCreateOneRecordInCache<Activity>({
      objectNameSingular: CoreObjectNameSingular.Activity,
    });

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState());

  const { record: currentWorkspaceMemberRecord } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    objectRecordId: currentWorkspaceMember?.id,
    depth: 0,
  });

  const { injectIntoActivityTargetInlineCellCache } =
    useInjectIntoActivityTargetInlineCellCache();

  const { attachRelationInBothDirections } =
    useAttachRelationInBothDirections();

  const createActivityInCache = useRecoilCallback(
    ({ snapshot, set }) =>
      ({
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

        const targetObjectRecords = targetableObjects
          .map((targetableObject) => {
            const targetObject = snapshot
              .getLoadable(recordStoreFamilyState(targetableObject.id))
              .getValue();

            return targetObject;
          })
          .filter(isDefined);

        const activityTargetsToCreate =
          makeActivityTargetsToCreateFromTargetableObjects({
            activityId,
            targetableObjects,
            targetObjectRecords,
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

        // TODO: should refactor when refactoring make activity connection utils
        set(recordStoreFamilyState(activityId), {
          ...createdActivityInCache,
          activityTargets: createdActivityTargetsInCache,
          comments: [],
        });

        return {
          createdActivityInCache: {
            ...createdActivityInCache,
            activityTargets: createdActivityTargetsInCache,
          },
          createdActivityTargetsInCache,
        };
      },
    [
      attachRelationInBothDirections,
      createManyActivityTargetsInCache,
      createOneActivityInCache,
      currentWorkspaceMemberRecord,
      injectIntoActivityTargetInlineCellCache,
    ],
  );

  return {
    createActivityInCache,
  };
};
