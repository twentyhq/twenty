import { useApolloClient } from '@apollo/client';

import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getTargetObjectFilterFieldName';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { MAX_QUERY_DEPTH_FOR_CACHE_INJECTION } from '@/object-record/cache/constants/MaxQueryDepthForCacheInjection';
import { getRecordConnectionFromRecords } from '@/object-record/cache/utils/getRecordConnectionFromRecords';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { useGenerateFindManyRecordsQuery } from '@/object-record/hooks/useGenerateFindManyRecordsQuery';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';

// TODO: How could we make this more generic ?
export const useOverwriteFindManyActivityTargetsQueryInCache = () => {
  const apolloClient = useApolloClient();

  const {
    objectMetadataItem: objectMetadataItemActivityTarget,
    findManyRecordsQuery: findManyActivityTargetsQuery,
  } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.ActivityTarget,
  });

  const generateFindManyRecordsQuery = useGenerateFindManyRecordsQuery();

  const writeActivityTargetsInCache = ({
    targetableObject,
    activityTargetsToInject,
  }: {
    targetableObject: Pick<
      ActivityTargetableObject,
      'id' | 'targetObjectNameSingular'
    >;
    activityTargetsToInject: ActivityTarget[];
  }) => {
    const findManyActivityTargetsQueryForCacheInjection =
      generateFindManyRecordsQuery({
        objectMetadataItem: objectMetadataItemActivityTarget,
        depth: MAX_QUERY_DEPTH_FOR_CACHE_INJECTION,
      });

    const targetObjectFieldName = getActivityTargetObjectFieldIdName({
      nameSingular: targetableObject.targetObjectNameSingular,
    });

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
        recordConnection: existingActivityTargetsForTargetableObjectQueryResult[
          objectMetadataItemActivityTarget.namePlural
        ] as ObjectRecordConnection<ActivityTarget>,
      });

    const newActivityTargetsForTargetableObject = [
      ...existingActivityTargetsForTargetableObject,
      ...activityTargetsToInject,
    ];

    const newActivityTargetsConnection = getRecordConnectionFromRecords({
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
  };

  return {
    writeActivityTargetsInCache,
  };
};
