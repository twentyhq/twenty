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
import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { DEFAULT_SEARCH_REQUEST_LIMIT } from '@/object-record/constants/DefaultSearchRequestLimit';
import { useCreateManyRecordsInCache } from '@/object-record/hooks/useCreateManyRecordsInCache';
import { useCreateOneRecordInCache } from '@/object-record/hooks/useCreateOneRecordInCache';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useModifyRecordFromCache } from '@/object-record/hooks/useModifyRecordFromCache';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';
import { ObjectRecordEdge } from '@/object-record/types/ObjectRecordEdge';
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

  const { triggerOptimisticEffects } = useOptimisticEffect({
    objectNameSingular: CoreObjectNameSingular.Activity,
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

      const createdActivityTargets = await createManyActivityTargetsInCache(
        activityTargetsToCreate,
      );

      const newActivityTargetsForOptimisticEffect = createdActivityTargets.map(
        (createdActivityTarget) => {
          return {
            __typename: capitalize(CoreObjectNameSingular.ActivityTarget),
            ...createdActivityTarget,
          };
        },
      );

      // await new Promise((resolve) => setTimeout(resolve, 5000));

      modifyActivityFromCache(createdActivityInCache.id, {
        activityTargets: (activityTargetsRef, { toReference }) => {
          const newActivityTargetsForCacheModify = createdActivityTargets.map(
            (createdActivityTarget) => {
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
            },
          );

          return {
            ...activityTargetsRef,
            edges: newActivityTargetsForCacheModify,
          };
        },
      });

      const newActivityTargetsForWriteQuery = createdActivityTargets.map(
        (createdActivityTarget) => {
          return {
            __typename: `${capitalize(
              CoreObjectNameSingular.ActivityTarget,
            )}Edge`,
            node: {
              __typename: capitalize(CoreObjectNameSingular.ActivityTarget),
              ...createdActivityTarget,
            },
            cursor: '',
          };
        },
      );

      const dataToUpdate = {
        [objectMetadataItemActivityTarget.namePlural]: {
          __typename: `${capitalize(
            CoreObjectNameSingular.ActivityTarget,
          )}Connection`,
          edges: newActivityTargetsForWriteQuery,
          pageInfo: {
            endCursor: '',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: '',
          },
        } as ObjectRecordConnection,
      };

      // await new Promise((resolve) => setTimeout(resolve, 5000));

      // console.log({
      //   dataToUpdate,
      // });

      // await new Promise((resolve) => setTimeout(resolve, 5000));

      apolloClient.writeQuery({
        query: findManyActivityTargetsQuery,
        variables: {
          filter: {
            activityId: {
              eq: activityId,
            },
          },
          limit: 60,
        },
        data: dataToUpdate,
      });

      // await new Promise((resolve) => setTimeout(resolve, 5000));

      apolloClient.writeQuery({
        query: findManyActivityTargetsQuery,
        variables: {
          filter: {
            activityId: {
              eq: activityId,
            },
          },
        },
        data: dataToUpdate,
      });

      const activityIds = activityTargets
        ?.map((activityTarget) => activityTarget.activityId)
        .filter(isNonEmptyString);

      // const exitistingActivitiesConnection = apolloClient.readQuery({
      //   query: findManyActivitiesQuery,
      //   variables: {
      //     filter: {
      //       id: {
      //         in: activityIds,
      //       },
      //     },
      //     limit: DEFAULT_SEARCH_REQUEST_LIMIT,
      //     orderBy: {
      //       createdAt: 'AscNullsFirst',
      //     },
      //   },
      // });

      // console.log({ exitistingActivitiesConnection });

      console.log({
        apolloClient: apolloClient.cache.extract(),
      });

      console.log({
        dataToUpdate,
      });

      // Read current cache state
      const { data: exitistingActivitiesConnection } = await apolloClient.query(
        {
          query: findManyActivitiesQuery,
          variables: {
            filter: {
              id: {
                in: activityTargets
                  ?.map((activityTarget) => activityTarget.activityId)
                  .filter(isNonEmptyString),
              },
            },
            limit: DEFAULT_SEARCH_REQUEST_LIMIT,
            orderBy: {
              createdAt: 'AscNullsFirst',
            },
          },
        },
      );

      const newActivities = (
        exitistingActivitiesConnection[
          objectMetadataItemActivity.namePlural
        ] as ObjectRecordConnection<Activity>
      ).edges.map((edge) => edge.node);

      newActivities.unshift({
        ...createdActivityInCache,
        __typename: 'Activity',
      });

      console.log({
        newActivities,
        dataToUpdateActivities: {
          [objectMetadataItemActivity.namePlural]: {
            __typename: `${capitalize(
              CoreObjectNameSingular.Activity,
            )}Connection`,
            edges: newActivities.map((activity) => ({
              __typename: `${capitalize(CoreObjectNameSingular.Activity)}Edge`,
              node: activity,
              cursor: '',
            })),
            pageInfo: {
              endCursor: '',
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: '',
            },
          } as ObjectRecordConnection<Activity>,
        },
        variables: {
          filter: {
            id: {
              in: newActivities.map((activity) => activity.id),
            },
          },
          limit: 60,
          orderBy: {
            createdAt: 'AscNullsFirst',
          },
        },
      });

      // await new Promise((resolve) => setTimeout(resolve, 5000));

      console.log({
        variables: {
          filter: {
            id: {
              in: newActivities.map((activity) => activity.id),
            },
          },
          limit: DEFAULT_SEARCH_REQUEST_LIMIT,
          orderBy: {
            createdAt: 'AscNullsFirst',
          },
        },
      });

      // Inject query for timeline findManyActivities
      apolloClient.writeQuery({
        query: findManyActivitiesQuery,
        variables: {
          filter: {
            id: {
              in: newActivities.map((activity) => activity.id),
            },
          },
          limit: DEFAULT_SEARCH_REQUEST_LIMIT,
          orderBy: {
            createdAt: 'AscNullsFirst',
          },
        },
        data: {
          [objectMetadataItemActivity.namePlural]: {
            __typename: `${capitalize(
              CoreObjectNameSingular.Activity,
            )}Connection`,
            edges: newActivities.map((activity) => ({
              __typename: `${capitalize(CoreObjectNameSingular.Activity)}Edge`,
              node: activity,
              cursor: '',
            })),
            pageInfo: {
              endCursor: '',
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: '',
            },
          } as ObjectRecordConnection<Activity>,
        },
      });

      const targetObjectFieldName = getActivityTargetObjectFieldIdName({
        nameSingular: targetableObject.targetObjectNameSingular,
      });

      // Inject query for useActivityTargets on targetableObject in Timeline
      const existingActivityTargetsForTargetableObject = apolloClient.readQuery(
        {
          query: findManyActivityTargetsQuery,
          variables: {
            filter: {
              [targetObjectFieldName]: {
                eq: targetableObject.id,
              },
            },
            limit: DEFAULT_SEARCH_REQUEST_LIMIT,
          },
        },
      );

      console.log({
        existingActivityTargetsForTargetableObject,
      });

      const newActivityTargetsForTargetableObject = createdActivityTargets
        .map((createdActivityTarget) => {
          return {
            __typename: `${capitalize(
              CoreObjectNameSingular.ActivityTarget,
            )}Edge`,
            node: {
              __typename: capitalize(CoreObjectNameSingular.ActivityTarget),
              ...createdActivityTarget,
            },
            cursor: '',
          } as ObjectRecordEdge<ActivityTarget>;
        })
        .concat(
          (
            existingActivityTargetsForTargetableObject[
              objectMetadataItemActivityTarget.namePlural
            ] as ObjectRecordConnection<ActivityTarget>
          ).edges,
        );

      apolloClient.writeQuery({
        query: findManyActivityTargetsQuery,
        variables: {
          filter: {
            [targetObjectFieldName]: {
              eq: targetableObject.id,
            },
          },
          limit: DEFAULT_SEARCH_REQUEST_LIMIT,
        },
        data: {
          [objectMetadataItemActivityTarget.namePlural]: {
            __typename: `${capitalize(
              CoreObjectNameSingular.ActivityTarget,
            )}Connection`,
            edges: newActivityTargetsForTargetableObject,
            pageInfo: {
              endCursor: '',
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: '',
            },
          } as ObjectRecordConnection<ActivityTarget>,
        },
      });

      // await new Promise((resolve) => setTimeout(resolve, 15000));

      setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
      setViewableActivityId(activityId);
      setActivityTargetableEntityArray(targetableObjects ?? []);
      openRightDrawer(RightDrawerPages.CreateActivity);

      // const test = await apolloClient.query({
      //   query: findManyActivityTargetsQuery,
      //   variables: {
      //     filter: {
      //       activityId: {
      //         eq: activityId,
      //       },
      //     },
      //   },
      // });

      // await new Promise((resolve) => setTimeout(resolve, 10000));

      // triggerOptimisticEffects({
      //   typename: `${capitalize(CoreObjectNameSingular.Activity)}Edge`,
      //   createdRecords: [createdActivityInCache],
      // });

      // triggerOptimisticEffects({
      //   typename: `${capitalize(CoreObjectNameSingular.ActivityTarget)}Edge`,
      //   createdRecords: newActivityTargetsForOptimisticEffect,
      // });
    },
    [
      openRightDrawer,
      setActivityTargetableEntityArray,
      createManyActivityTargetsInCache,
      setHotkeyScope,
      setViewableActivityId,
      createOneActivityInCache,
      modifyActivityFromCache,
      triggerOptimisticEffects,
      workspaceMemberRecord,
      apolloClient,
      findManyActivityTargetsQuery,
      objectMetadataItemActivityTarget,
      activityTargets,
      findManyActivitiesQuery,
      objectMetadataItemActivity,
    ],
  );
};
