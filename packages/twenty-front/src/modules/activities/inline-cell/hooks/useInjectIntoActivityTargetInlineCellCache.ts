import { useApolloClient } from '@apollo/client';

import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getRecordConnectionFromEdges } from '@/object-record/cache/utils/getRecordConnectionFromEdges';
import { getRecordEdgeFromRecord } from '@/object-record/cache/utils/getRecordEdgeFromRecord';

export const useInjectIntoActivityTargetInlineCellCache = () => {
  const apolloClient = useApolloClient();

  const {
    objectMetadataItem: objectMetadataItemActivityTarget,
    findManyRecordsQuery: findManyActivityTargetsQuery,
  } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.ActivityTarget,
  });

  const injectIntoActivityTargetInlineCellCache = ({
    activityId,
    activityTargetsToInject,
  }: {
    activityId: string;
    activityTargetsToInject: ActivityTarget[];
  }) => {
    const newActivityTargetEdgesForCache = activityTargetsToInject.map(
      (activityTargetToInject) =>
        getRecordEdgeFromRecord({
          objectNameSingular: CoreObjectNameSingular.ActivityTarget,
          record: activityTargetToInject,
        }),
    );

    const newActivityTargetConnectionForCache = getRecordConnectionFromEdges({
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
      edges: newActivityTargetEdgesForCache,
    });

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
          newActivityTargetConnectionForCache,
      },
    });
  };

  return {
    injectIntoActivityTargetInlineCellCache,
  };
};
