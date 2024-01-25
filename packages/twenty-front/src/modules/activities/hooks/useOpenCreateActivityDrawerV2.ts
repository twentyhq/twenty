import { useCallback } from 'react';
import { useApolloClient } from '@apollo/client';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilState, useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { useActivityTargets } from '@/activities/hooks/useActivityTargets';
import { Activity, ActivityType } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { flattenTargetableObjectsAndTheirRelatedTargetableObjects } from '@/activities/utils/flattenTargetableObjectsAndTheirRelatedTargetableObjects';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getTargetObjectFilterFieldName';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateManyRecordsInCache } from '@/object-record/hooks/useCreateManyRecordsInCache';
import { useCreateOneRecordInCache } from '@/object-record/hooks/useCreateOneRecordInCache';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useModifyRecordFromCache } from '@/object-record/hooks/useModifyRecordFromCache';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';
import { createRecordConnectionFromEdges } from '@/object-record/utils/createRecordConnectionFromEdges';
import { createRecordConnectionFromRecords } from '@/object-record/utils/createRecordConnectionFromRecords';
import { createRecordEdgeFromRecord } from '@/object-record/utils/createRecordEdgeFromRecord';
import { getRecordsFromRecordConnection } from '@/object-record/utils/getRecordsFromRecordConnection';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { capitalize } from '~/utils/string/capitalize';

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
  const setHotkeyScope = useSetHotkeyScope();

  const [, setActivityTargetableEntityArray] = useRecoilState(
    activityTargetableEntityArrayState,
  );
  const [, setViewableActivityId] = useRecoilState(viewableActivityIdState);

  const {
    objectMetadataItem: objectMetadataItemActivity,
    findManyRecordsQuery: findManyActivitiesQuery,
  } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Activity,
  });

  const { activityTargets } = useActivityTargets({
    targetableObject,
  });

  const {
    objectMetadataItem: objectMetadataItemActivityTarget,
    findManyRecordsQuery: findManyActivityTargetsQuery,
  } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.ActivityTarget,
  });

  const { record: workspaceMemberRecord } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    objectRecordId: currentWorkspaceMember?.id,
  });

  const modifyActivityFromCache = useModifyRecordFromCache({
    objectMetadataItem: objectMetadataItemActivity,
  });

  const apolloClient = useApolloClient();

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

      const flattenedTargetableObjects = targetableObjects
        ? flattenTargetableObjectsAndTheirRelatedTargetableObjects(
            targetableObjects,
          )
        : [];

      const activityTargetsToCreate = flattenedTargetableObjects.map(
        (targetableObject) => {
          const targetableObjectFieldIdName =
            getActivityTargetObjectFieldIdName({
              nameSingular: targetableObject.targetObjectNameSingular,
            });

          return {
            [targetableObject.targetObjectNameSingular]:
              targetableObject.targetObjectRecord,
            [targetableObjectFieldIdName]: targetableObject.id,
            activityId: createdActivityInCache.id,
            id: v4(),
          };
        },
      );

      const createdActivityTargetsInCache =
        await createManyActivityTargetsInCache(activityTargetsToCreate);

      const newActivityTargetEdgesForCache = createdActivityTargetsInCache.map(
        (createdActivityTarget) => {
          return createRecordEdgeFromRecord({
            objectNameSingular: CoreObjectNameSingular.ActivityTarget,
            record: createdActivityTarget,
          });
        },
      );

      const newActivityTargetConnectionInCache =
        createRecordConnectionFromEdges({
          objectNameSingular: CoreObjectNameSingular.ActivityTarget,
          edges: newActivityTargetEdgesForCache,
        });

      // Those requests are not mounted yet, so triggering optimistic effect here would be useless
      apolloClient.writeQuery({
        query: findManyActivityTargetsQuery,
        variables: {
          filter: {
            activityId: {
              eq: activityId,
            },
          },
        },
        data: {
          [objectMetadataItemActivityTarget.namePlural]:
            newActivityTargetConnectionInCache,
        },
      });

      // Try to trigger optimistic effect here
      // It doesn't work because the requests are not mounted yet

      // This read/write could be replaced by a trigger optimistic effect create on activities
      // Read current cache state
      const { data: exitistingActivitiesQueryResult } =
        await apolloClient.query({
          query: findManyActivitiesQuery,
          variables: {
            filter: {
              id: {
                in: activityTargets
                  ?.map((activityTarget) => activityTarget.activityId)
                  .filter(isNonEmptyString),
              },
            },
            orderBy: {
              createdAt: 'AscNullsFirst',
            },
          },
        });

      const newActivities = getRecordsFromRecordConnection({
        recordConnection: exitistingActivitiesQueryResult[
          objectMetadataItemActivity.namePlural
        ] as ObjectRecordConnection<Activity>,
      });

      newActivities.unshift({
        ...createdActivityInCache,
        __typename: 'Activity',
      });

      const newActivityIds = newActivities.map((activity) => activity.id);

      const newActivityConnectionForCache = createRecordConnectionFromRecords({
        objectNameSingular: CoreObjectNameSingular.Activity,
        records: newActivities,
      });

      // Inject query for timeline findManyActivities before it gets mounted
      apolloClient.writeQuery({
        query: findManyActivitiesQuery,
        variables: {
          filter: {
            id: {
              in: newActivityIds,
            },
          },
          orderBy: {
            createdAt: 'AscNullsFirst',
          },
        },
        data: {
          [objectMetadataItemActivity.namePlural]:
            newActivityConnectionForCache,
        },
      });

      const targetObjectFieldName = getActivityTargetObjectFieldIdName({
        nameSingular: targetableObject.targetObjectNameSingular,
      });

      // This read/write too ?
      // This could be replaced by a trigger optimistic effect create on activityTargets
      // Inject query for useActivityTargets on targetableObject in Timeline
      const existingActivityTargetsForTargetableObjectQueryResult =
        apolloClient.readQuery({
          query: findManyActivityTargetsQuery,
          variables: {
            filter: {
              [targetObjectFieldName]: {
                eq: targetableObject.id,
              },
            },
          },
        });

      const existingActivityTargetsForTargetableObject =
        getRecordsFromRecordConnection({
          recordConnection:
            existingActivityTargetsForTargetableObjectQueryResult[
              objectMetadataItemActivityTarget.namePlural
            ] as ObjectRecordConnection<ActivityTarget>,
        });

      const newActivityTargetsForTargetableObject = [
        ...existingActivityTargetsForTargetableObject,
        ...createdActivityTargetsInCache,
      ];

      const newActivityTargetsConnection = createRecordConnectionFromRecords({
        objectNameSingular: CoreObjectNameSingular.ActivityTarget,
        records: newActivityTargetsForTargetableObject,
      });

      apolloClient.writeQuery({
        query: findManyActivityTargetsQuery,
        variables: {
          filter: {
            [targetObjectFieldName]: {
              eq: targetableObject.id,
            },
          },
        },
        data: {
          [objectMetadataItemActivityTarget.namePlural]:
            newActivityTargetsConnection,
        },
      });

      // This could be replaced by a trigger optimistic effect on relations of activity
      // Can this be replaced by a trigger optimistic effect ?
      // This has no effect right now
      modifyActivityFromCache(createdActivityInCache.id, {
        activityTargets: (activityTargetsRef, { toReference }) => {
          const newActivityTargetsForCacheModify =
            createdActivityTargetsInCache.map((createdActivityTarget) => {
              const activityTargetRef = toReference({
                __typename: capitalize(CoreObjectNameSingular.ActivityTarget),
                id: createdActivityTarget.id,
              });

              return {
                __typename: `${capitalize(
                  CoreObjectNameSingular.ActivityTarget,
                )}Edge`,
                node: activityTargetRef,
              };
            });

          console.log({
            activityTargetsRef,
            newActivityTargetsForCacheModify,
            newState: {
              ...activityTargetsRef,
              edges: newActivityTargetsForCacheModify,
            },
          });

          return {
            ...activityTargetsRef,
            edges: newActivityTargetsForCacheModify,
          };
        },
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
      modifyActivityFromCache,
      workspaceMemberRecord,
      apolloClient,
      findManyActivityTargetsQuery,
      objectMetadataItemActivityTarget,
      activityTargets,
      findManyActivitiesQuery,
      objectMetadataItemActivity,
      targetableObject,
    ],
  );
};
