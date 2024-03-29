import { useRecoilCallback, useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { useInjectIntoActivityTargetInlineCellCache } from '@/activities/inline-cell/hooks/useInjectIntoActivityTargetInlineCellCache';
import { Activity, ActivityType } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { makeActivityTargetsToCreateFromTargetableObjects } from '@/activities/utils/getActivityTargetsToCreateFromTargetableObjects';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useModifyRecordFromCache } from '@/object-record/cache/hooks/useModifyRecordFromCache';
import { getRecordConnectionFromRecords } from '@/object-record/cache/utils/getRecordConnectionFromRecords';
import { useCreateManyRecordsInCache } from '@/object-record/hooks/useCreateManyRecordsInCache';
import { useCreateOneRecordInCache } from '@/object-record/hooks/useCreateOneRecordInCache';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useCreateActivityInCache = () => {
  const { createManyRecordsInCache: createManyActivityTargetsInCache } =
    useCreateManyRecordsInCache<ActivityTarget>({
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
    });

  const { createOneRecordInCache: createOneActivityInCache } =
    useCreateOneRecordInCache<Activity>({
      objectNameSingular: CoreObjectNameSingular.Activity,
    });

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { record: currentWorkspaceMemberRecord } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    objectRecordId: currentWorkspaceMember?.id,
    depth: 0,
  });

  const { injectIntoActivityTargetInlineCellCache } =
    useInjectIntoActivityTargetInlineCellCache();

  const { objectMetadataItem: objectMetadataItemActivity } =
    useObjectMetadataItemOnly({
      objectNameSingular: CoreObjectNameSingular.Activity,
    });

  const { objectMetadataItem: objectMetadataItemActivityTarget } =
    useObjectMetadataItemOnly({
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
    });

  const modifyActivityFromCache = useModifyRecordFromCache({
    objectMetadataItem: objectMetadataItemActivity,
  });

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

        if (isUndefinedOrNull(createdActivityInCache)) {
          return;
        }

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
            activity: createdActivityInCache,
            targetableObjects,
            targetObjectRecords,
          });

        const createdActivityTargetsInCache = createManyActivityTargetsInCache(
          activityTargetsToCreate,
        );

        const activityTargetsConnection = getRecordConnectionFromRecords({
          objectMetadataItems: objectMetadataItems,
          objectMetadataItem: objectMetadataItemActivityTarget,
          records: createdActivityTargetsInCache,
          withPageInfo: false,
          computeReferences: true,
          isRootLevel: false,
        });

        modifyActivityFromCache(createdActivityInCache.id, {
          activityTargets: () => activityTargetsConnection,
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
      createOneActivityInCache,
      currentWorkspaceMemberRecord,
      objectMetadataItems,
      createManyActivityTargetsInCache,
      objectMetadataItemActivityTarget,
      modifyActivityFromCache,
    ],
  );

  return {
    createActivityInCache,
  };
};
