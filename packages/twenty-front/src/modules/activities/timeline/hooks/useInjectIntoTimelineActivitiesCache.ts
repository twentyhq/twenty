import { useApolloClient } from '@apollo/client';

import { makeTimelineActivitiesQueryVariables } from '@/activities/timeline/utils/makeTimelineActivitiesQueryVariables';
import { Activity } from '@/activities/types/Activity';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

export const useInjectIntoTimelineActivitiesCache = ({
  activitiesToInject,
}: {
  activitiesToInject: Activity[];
}) => {
  const apolloClient = useApolloClient();

  const {
    objectMetadataItem: objectMetadataItemActivity,
    findManyRecordsQuery: findManyActivitiesQuery,
  } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Activity,
  });

  const timelineActivitiesQueryVariables = makeTimelineActivitiesQueryVariables(
    {
      activityIds,
    },
  );

  // Inject query for timeline findManyActivities before it gets mounted
  apolloClient.writeQuery({
    query: findManyActivitiesQuery,
    variables: timelineActivitiesQueryVariables,
    data: {
      [objectMetadataItemActivity.namePlural]: newActivityConnectionForCache,
    },
  });
};
