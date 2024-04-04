import { Reference, useApolloClient } from '@apollo/client';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { Activity, ActivityType } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { makeActivityTargetsToCreateFromTargetableObjects } from '@/activities/utils/getActivityTargetsToCreateFromTargetableObjects';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateManyRecordsInCache } from '@/object-record/cache/hooks/useCreateManyRecordsInCache';
import { useCreateOneRecordInCache } from '@/object-record/cache/hooks/useCreateOneRecordInCache';
import { getRecordConnectionFromRecords } from '@/object-record/cache/utils/getRecordConnectionFromRecords';
import { modifyRecordFromCache } from '@/object-record/cache/utils/modifyRecordFromCache';
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

  const cache = useApolloClient().cache;

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { record: currentWorkspaceMemberRecord } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    objectRecordId: currentWorkspaceMember?.id,
    depth: 0,
  });

  const { objectMetadataItem: objectMetadataItemActivity } =
    useObjectMetadataItemOnly({
      objectNameSingular: CoreObjectNameSingular.Activity,
    });

  const { objectMetadataItem: objectMetadataItemActivityTarget } =
    useObjectMetadataItemOnly({
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
    });

  const createOneActivityInCache = useCreateOneRecordInCache<Activity>({
    objectMetadataItem: objectMetadataItemActivity,
  });

  const createActivityInCache = useRecoilCallback(
    ({ snapshot, set }) =>
      ({
        type,
        targetObject,
        customAssignee,
      }: {
        type: ActivityType;
        targetObject?: ActivityTargetableObject;
        customAssignee?: WorkspaceMember;
      }) => {
        const activityId = v4();

        const createdActivityInCache = createOneActivityInCache({
          id: activityId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: currentWorkspaceMemberRecord,
          authorId: currentWorkspaceMemberRecord?.id,
          assignee: customAssignee ?? currentWorkspaceMemberRecord,
          assigneeId: customAssignee?.id ?? currentWorkspaceMemberRecord?.id,
          type,
        });

        if (isUndefinedOrNull(createdActivityInCache)) {
          throw new Error('Failed to create activity in cache');
        }

        if (isUndefinedOrNull(targetObject)) {
          set(recordStoreFamilyState(activityId), {
            ...createdActivityInCache,
            activityTargets: [],
            comments: [],
          });

          return {
            createdActivityInCache: {
              ...createdActivityInCache,
              activityTargets: [],
            },
          };
        }

        const targetObjectRecord = snapshot
          .getLoadable(recordStoreFamilyState(targetObject.id))
          .getValue();

        if (isUndefinedOrNull(targetObjectRecord)) {
          throw new Error('Failed to find target object record');
        }

        const activityTargetsToCreate =
          makeActivityTargetsToCreateFromTargetableObjects({
            activity: createdActivityInCache,
            targetableObjects: [targetObject],
            targetObjectRecords: [targetObjectRecord],
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

        modifyRecordFromCache({
          recordId: createdActivityInCache.id,
          cache,
          fieldModifiers: {
            activityTargets: () => activityTargetsConnection,
          },
          objectMetadataItem: objectMetadataItemActivity,
        });

        const targetObjectMetadataItem = objectMetadataItems.find(
          (item) => item.nameSingular === targetObject.targetObjectNameSingular,
        );

        if (isDefined(targetObjectMetadataItem)) {
          modifyRecordFromCache({
            cache,
            objectMetadataItem: targetObjectMetadataItem,
            recordId: targetObject.id,
            fieldModifiers: {
              activityTargets: (activityTargetsRef, { readField }) => {
                const edges = readField<{ node: Reference }[]>(
                  'edges',
                  activityTargetsRef,
                );

                if (!edges) return activityTargetsRef;

                return {
                  ...activityTargetsRef,
                  edges: [...edges, ...activityTargetsConnection.edges],
                };
              },
            },
          });
        }

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
        };
      },
    [
      createOneActivityInCache,
      currentWorkspaceMemberRecord,
      createManyActivityTargetsInCache,
      objectMetadataItems,
      objectMetadataItemActivityTarget,
      cache,
      objectMetadataItemActivity,
    ],
  );

  return {
    createActivityInCache,
  };
};
