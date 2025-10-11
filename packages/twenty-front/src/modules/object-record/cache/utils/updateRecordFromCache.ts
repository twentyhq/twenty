import { type ApolloCache } from '@apollo/client/cache';
import gql from 'graphql-tag';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { type RecordGqlFields } from '@/object-record/graphql/record-gql-fields/types/RecordGqlFields';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ObjectPermissions } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const updateRecordFromCache = <T extends ObjectRecord>({
  objectMetadataItems,
  objectMetadataItem,
  cache,
  recordGqlFields,
  record,
  objectPermissionsByObjectMetadataId,
}: {
  objectMetadataItems: ObjectMetadataItem[];
  objectMetadataItem: ObjectMetadataItem;
  cache: ApolloCache<object>;
  recordGqlFields: RecordGqlFields;
  record: T;
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
}) => {
  if (isUndefinedOrNull(objectMetadataItem)) {
    return null;
  }

  const capitalizedObjectName = capitalize(objectMetadataItem.nameSingular);

  const cacheWriteFragment = gql`
      fragment ${capitalizedObjectName}Fragment on ${capitalizedObjectName} ${mapObjectMetadataToGraphQLQuery(
        {
          objectMetadataItems,
          objectMetadataItem,
          computeReferences: true,
          recordGqlFields,
          objectPermissionsByObjectMetadataId,
        },
      )}
    `;

  const cachedRecordId = cache.identify({
    __typename: capitalize(objectMetadataItem.nameSingular),
    id: record.id,
  });

  const recordWithConnection = getRecordNodeFromRecord<T>({
    objectMetadataItems,
    objectMetadataItem,
    record,
  });

  if (isUndefinedOrNull(recordWithConnection)) {
    return;
  }

  cache.writeFragment<RecordGqlNode>({
    id: cachedRecordId,
    fragment: cacheWriteFragment,
    data: recordWithConnection,
  });
};
