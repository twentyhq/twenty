import { useApolloClient } from '@apollo/client';
import { isNonEmptyString } from '@sniptt/guards';

import { makeTimelineActivitiesQueryVariables } from '@/activities/timeline/utils/makeTimelineActivitiesQueryVariables';
import { Activity } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getRecordConnectionFromRecords } from '@/object-record/cache/utils/getRecordConnectionFromRecords';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';

export const useInjectIntoTimelineActivitiesQuery = () => {
  const apolloClient = useApolloClient();

  const {
    objectMetadataItem: objectMetadataItemActivity,
    findManyRecordsQuery: findManyActivitiesQuery,
  } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Activity,
  });

  const injectIntoTimelineActivitiesQuery = ({
    activityTargets,
    activityToInject,
  }: {
    activityTargets: ActivityTarget[];
    activityToInject: Activity;
  }) => {
    const activityIds = activityTargets
      ?.map((activityTarget) => activityTarget.activityId)
      .filter(isNonEmptyString);

    const timelineActivitiesQueryVariables =
      makeTimelineActivitiesQueryVariables({
        activityIds,
      });

    const exitistingActivitiesQueryResult = apolloClient.readQuery({
      query: findManyActivitiesQuery,
      variables: timelineActivitiesQueryVariables,
    });

    const extistingActivities = exitistingActivitiesQueryResult
      ? getRecordsFromRecordConnection({
          recordConnection: exitistingActivitiesQueryResult[
            objectMetadataItemActivity.namePlural
          ] as ObjectRecordConnection<Activity>,
        })
      : [];

    const newActivity = {
      ...activityToInject,
      __typename: 'Activity',
    };

    const newActivitiesSortedAsActivitiesQuery = [
      newActivity,
      ...extistingActivities,
    ];

    const newActivityIdsSortedAsActivityTargetsQuery = [
      ...extistingActivities,
      newActivity,
    ].map((activity) => activity.id);

    const newTimelineActivitiesQueryVariables =
      makeTimelineActivitiesQueryVariables({
        activityIds: newActivityIdsSortedAsActivityTargetsQuery,
      });

    const newActivityConnectionForCache = getRecordConnectionFromRecords({
      objectNameSingular: CoreObjectNameSingular.Activity,
      records: newActivitiesSortedAsActivitiesQuery,
    });

    apolloClient.writeQuery({
      query: findManyActivitiesQuery,
      variables: newTimelineActivitiesQueryVariables,
      data: {
        [objectMetadataItemActivity.namePlural]: newActivityConnectionForCache,
      },
    });
  };

  return {
    injectIntoTimelineActivitiesNextQuery: injectIntoTimelineActivitiesQuery,
  };
};
