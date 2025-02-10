import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { RecordGqlFields } from '@/object-record/graphql/types/RecordGqlFields';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useApolloClient } from '@apollo/client';
import { useCallback } from 'react';

type MinimalRecord = Pick<ObjectRecord, 'id' | '__typename'>;

export const useGetRecordFromCacheOrMinimalRecord = ({
  objectNameSingular,
  recordGqlFields,
}: {
  objectNameSingular: string;
  recordGqlFields?: RecordGqlFields;
}) => {
  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular,
    recordGqlFields,
  });
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });
  const apolloClient = useApolloClient();

  return useCallback(
    <T extends ObjectRecord = ObjectRecord>(
      recordId: string,
      cache = apolloClient.cache,
    ): T | MinimalRecord => {
      const minimalRecord = {
        __typename: getObjectTypename(objectMetadataItem.nameSingular),
        id: recordId,
      };
      return getRecordFromCache<T>(recordId, cache) ?? minimalRecord;
    },
    [objectMetadataItem, apolloClient, getRecordFromCache],
  );
};
