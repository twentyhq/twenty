import { useApolloClient } from '@apollo/client';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { MAX_QUERY_DEPTH_FOR_CACHE_INJECTION } from '@/object-record/cache/constants/MaxQueryDepthForCacheInjection';
import { getRecordConnectionFromRecords } from '@/object-record/cache/utils/getRecordConnectionFromRecords';
import { useGenerateFindManyRecordsQuery } from '@/object-record/hooks/useGenerateFindManyRecordsQuery';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordQueryVariables } from '@/object-record/types/ObjectRecordQueryVariables';

export const useUpsertFindManyRecordsQueryInCache = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const apolloClient = useApolloClient();

  const generateFindManyRecordsQuery = useGenerateFindManyRecordsQuery();

  const upsertFindManyRecordsQueryInCache = <
    T extends ObjectRecord = ObjectRecord,
  >({
    queryVariables,
    objectRecordsToOverwrite,
  }: {
    queryVariables: ObjectRecordQueryVariables;
    objectRecordsToOverwrite: T[];
  }) => {
    const findManyRecordsQueryForCacheOverwrite = generateFindManyRecordsQuery({
      objectMetadataItem,
      depth: MAX_QUERY_DEPTH_FOR_CACHE_INJECTION,
    });

    const newObjectRecordConnection = getRecordConnectionFromRecords({
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
      records: objectRecordsToOverwrite,
    });

    apolloClient.writeQuery({
      query: findManyRecordsQueryForCacheOverwrite,
      variables: queryVariables,
      data: {
        [objectMetadataItem.namePlural]: newObjectRecordConnection,
      },
    });
  };

  return {
    upsertFindManyRecordsQueryInCache,
  };
};
