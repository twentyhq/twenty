import { useApolloClient } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { MAX_QUERY_DEPTH_FOR_CACHE_INJECTION } from '@/object-record/cache/constants/MaxQueryDepthForCacheInjection';
import { getRecordConnectionFromRecords } from '@/object-record/cache/utils/getRecordConnectionFromRecords';
import { useGenerateFindManyRecordsQuery } from '@/object-record/hooks/useGenerateFindManyRecordsQuery';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordQueryVariables } from '@/object-record/types/ObjectRecordQueryVariables';

export const useUpsertFindManyRecordsQueryInCache = ({
  objectMetadataItem,
}: {
  objectMetadataItem: Pick<
    ObjectMetadataItem,
    'fields' | 'namePlural' | 'nameSingular'
  >;
}) => {
  const apolloClient = useApolloClient();

  const generateFindManyRecordsQuery = useGenerateFindManyRecordsQuery();
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const upsertFindManyRecordsQueryInCache = <
    T extends ObjectRecord = ObjectRecord,
  >({
    queryVariables,
    depth = MAX_QUERY_DEPTH_FOR_CACHE_INJECTION,
    objectRecordsToOverwrite,
    queryFields,
  }: {
    queryVariables: ObjectRecordQueryVariables;
    depth?: number;
    objectRecordsToOverwrite: T[];
    queryFields?: Record<string, any>;
    eagerLoadedRelations?: Record<string, any>;
  }) => {
    const findManyRecordsQueryForCacheOverwrite = generateFindManyRecordsQuery({
      objectMetadataItem,
      depth,
      queryFields,
    });

    const newObjectRecordConnection = getRecordConnectionFromRecords({
      objectMetadataItems: objectMetadataItems,
      objectMetadataItem: objectMetadataItem,
      records: objectRecordsToOverwrite,
      queryFields,
    });

    console.log(newObjectRecordConnection);
    console.log(findManyRecordsQueryForCacheOverwrite);

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
