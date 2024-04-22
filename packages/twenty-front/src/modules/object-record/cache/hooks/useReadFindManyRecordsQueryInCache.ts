import { useApolloClient } from '@apollo/client';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordQueryResult } from '@/object-record/types/ObjectRecordQueryResult';
import { ObjectRecordQueryVariables } from '@/object-record/types/ObjectRecordQueryVariables';
import { generateFindManyRecordsQuery } from '@/object-record/utils/generateFindManyRecordsQuery';
import { isDefined } from '~/utils/isDefined';

export const useReadFindManyRecordsQueryInCache = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const apolloClient = useApolloClient();

  const { objectMetadataItems } = useObjectMetadataItems();

  const readFindManyRecordsQueryInCache = <
    T extends ObjectRecord = ObjectRecord,
  >({
    queryVariables,
    queryFields,
    depth,
  }: {
    queryVariables: ObjectRecordQueryVariables;
    queryFields?: Record<string, any>;
    depth?: number;
  }) => {
    const findManyRecordsQueryForCacheRead = generateFindManyRecordsQuery({
      objectMetadataItem,
      objectMetadataItems,
      queryFields,
      depth,
    });

    const existingRecordsQueryResult = apolloClient.readQuery<
      ObjectRecordQueryResult<T>
    >({
      query: findManyRecordsQueryForCacheRead,
      variables: queryVariables,
    });

    const existingRecordConnection =
      existingRecordsQueryResult?.[objectMetadataItem.namePlural];

    const existingObjectRecords = isDefined(existingRecordConnection)
      ? getRecordsFromRecordConnection({
          recordConnection: existingRecordConnection,
        })
      : [];

    return existingObjectRecords;
  };

  return {
    readFindManyRecordsQueryInCache,
  };
};
