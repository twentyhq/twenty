import { useApolloClient } from '@apollo/client';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { useAttachRelationInBothDirections } from '@/activities/hooks/useAttachRelationInBothDirections';
import { useInjectIntoActivityTargetInlineCellCache } from '@/activities/inline-cell/hooks/useInjectIntoActivityTargetInlineCellCache';
import { Activity, ActivityType } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { makeActivityTargetsToCreateFromTargetableObjects } from '@/activities/utils/getActivityTargetsToCreateFromTargetableObjects';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useModifyRecordFromCache } from '@/object-record/cache/hooks/useModifyRecordFromCache';
import { getReferenceRecordConnectionFromRecords } from '@/object-record/cache/utils/getReferenceRecordConnectionFromRecords';
import { useCreateManyRecordsInCache } from '@/object-record/hooks/useCreateManyRecordsInCache';
import { useCreateOneRecordInCache } from '@/object-record/hooks/useCreateOneRecordInCache';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useMapRelationRecordsToRelationConnection } from '@/object-record/hooks/useMapRelationRecordsToRelationConnection';
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

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { record: currentWorkspaceMemberRecord } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    objectRecordId: currentWorkspaceMember?.id,
    depth: 0,
  });

  const { injectIntoActivityTargetInlineCellCache } =
    useInjectIntoActivityTargetInlineCellCache();

  const { attachRelationInBothDirections } =
    useAttachRelationInBothDirections();

  const { mapRecordRelationRecordsToRelationConnection } =
    useMapRelationRecordsToRelationConnection();

  const { objectMetadataItem: objectMetadataItemActivity } =
    useObjectMetadataItemOnly({
      objectNameSingular: CoreObjectNameSingular.Activity,
    });

  const modifyActivityFromCache = useModifyRecordFromCache({
    objectMetadataItem: objectMetadataItemActivity,
  });

  const client = useApolloClient();

  const cache = client.cache;

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

        const createdActivityInCache = createOneActivityInCache(
          {
            id: activityId,
            author: currentWorkspaceMemberRecord,
            authorId: currentWorkspaceMemberRecord?.id,
            assignee: customAssignee ?? currentWorkspaceMemberRecord,
            assigneeId: customAssignee?.id ?? currentWorkspaceMemberRecord?.id,
            type,
          },
          {
            author: true,
            assignee: true,
            // TODO: this is very hacky because it is silently tied to cache.modify which can't create a field if it doesn't exist
            // We should find a way to explicitly have to put the field that could be later modified in the creation schema
            activityTargets: true,
          },
        );

        const targetObjectRecords = targetableObjects
          .map((targetableObject) => {
            const targetObject = snapshot
              .getLoadable(recordStoreFamilyState(targetableObject.id))
              .getValue();

            const targetObjectWithRelationConnection =
              mapRecordRelationRecordsToRelationConnection({
                objectRecord: targetObject,
                objectNameSingular: targetableObject.targetObjectNameSingular,
                depth: 5,
              });

            return targetObjectWithRelationConnection;
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
          // TODO: add all non system objects
          {
            person: true,
            company: true,
          },
        );

        const activityTargetsConnection =
          getReferenceRecordConnectionFromRecords({
            apolloClient: client,
            objectNameSingular: CoreObjectNameSingular.ActivityTarget,
            records: createdActivityTargetsInCache,
          });

        modifyActivityFromCache(createdActivityInCache.id, {
          activityTargets: () => activityTargetsConnection,
        });

        injectIntoActivityTargetInlineCellCache({
          activityId,
          activityTargetsToInject: createdActivityTargetsInCache,
        });

        // attachRelationInBothDirections({
        //   sourceRecord: createdActivityInCache,
        //   fieldNameOnSourceRecord: 'activityTargets',
        //   sourceObjectNameSingular: CoreObjectNameSingular.Activity,
        //   fieldNameOnTargetRecord: 'activity',
        //   targetObjectNameSingular: CoreObjectNameSingular.ActivityTarget,
        //   targetRecords: createdActivityTargetsInCache,
        // });

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
      createManyActivityTargetsInCache,
      createOneActivityInCache,
      currentWorkspaceMemberRecord,
      injectIntoActivityTargetInlineCellCache,
      mapRecordRelationRecordsToRelationConnection,
      client,
      modifyActivityFromCache,
      attachRelationInBothDirections,
    ],
  );

  return {
    createActivityInCache,
  };
};
