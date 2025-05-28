import { ApolloCache, gql } from '@apollo/client';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { RecordGqlFields } from '@/object-record/graphql/types/RecordGqlFields';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { capitalize } from 'twenty-shared/utils';
import { ObjectPermission } from '~/generated-metadata/graphql';
import { isEmptyObject } from '~/utils/isEmptyObject';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export type GetRecordFromCacheArgs = {
  cache: ApolloCache<object>;
  recordId: string;
  objectMetadataItems: ObjectMetadataItem[];
  objectMetadataItem: ObjectMetadataItem;
  recordGqlFields?: RecordGqlFields;
  objectPermissionsByObjectMetadataId?: Record<string, ObjectPermission>;
};

export const getRecordFromCache = <T extends ObjectRecord>({
  cache,
  recordId,
  objectMetadataItems,
  objectMetadataItem,
  recordGqlFields,
  objectPermissionsByObjectMetadataId,
}: GetRecordFromCacheArgs): T | null => {
  const capitalizedObjectName = capitalize(objectMetadataItem.nameSingular);

  const appliedRecordGqlFields =
    recordGqlFields ??
    generateDepthOneRecordGqlFields({
      objectMetadataItem,
    });

  if (isEmptyObject(appliedRecordGqlFields)) {
    return null;
  }

  const cacheReadFragment = gql`
      fragment ${capitalizedObjectName}Fragment on ${capitalizedObjectName} ${mapObjectMetadataToGraphQLQuery(
        {
          objectMetadataItems,
          objectMetadataItem,
          recordGqlFields: appliedRecordGqlFields,
          objectPermissionsByObjectMetadataId,
        },
      )}
    `;

  const cachedRecordId = cache.identify({
    __typename: capitalizedObjectName,
    id: recordId,
  });

  const cachedRecord = cache.readFragment({
    id: cachedRecordId,
    fragment: cacheReadFragment,
  });

  if (isUndefinedOrNull(cachedRecord)) {
    return null;
  }

  return getRecordFromRecordNode<T>({
    recordNode: cachedRecord as any,
  });
};
