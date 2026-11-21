import gql from 'graphql-tag';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { type ReadableRelationWithArguments } from '@/object-record/graphql/types/ReadableRelationWithArguments';
import { getReadableRelationsWithArguments } from '@/object-record/graphql/utils/getReadableRelationsWithArguments';
import { getRelationsWithArgumentsVariableDefinitions } from '@/object-record/graphql/utils/getRelationsWithArgumentsVariableDefinitions';
import {
  type ObjectRecordsPermissions,
  type QueryCursorDirection,
  type RecordGqlFields,
} from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

export const generateFindManyRecordsQuery = ({
  objectMetadataItem,
  objectMetadataItems,
  recordGqlFields,
  computeReferences,
  cursorDirection,
  objectPermissionsByObjectMetadataId,
  readableRelationsWithArguments = getReadableRelationsWithArguments({
    objectMetadataItem,
    objectMetadataItems,
    recordGqlFields,
    objectPermissionsByObjectMetadataId,
  }),
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  recordGqlFields?: RecordGqlFields;
  computeReferences?: boolean;
  cursorDirection?: QueryCursorDirection;
  objectPermissionsByObjectMetadataId: Record<string, ObjectRecordsPermissions>;
  readableRelationsWithArguments?: ReadableRelationWithArguments[];
}) => gql`
query FindMany${capitalize(
  objectMetadataItem.namePlural,
)}($filter: ${capitalize(
  objectMetadataItem.nameSingular,
)}FilterInput, $orderBy: [${capitalize(
  objectMetadataItem.nameSingular,
)}OrderByInput], $lastCursor: String, $limit: Int, $offset: Int${getRelationsWithArgumentsVariableDefinitions(
  readableRelationsWithArguments,
)}) {
  ${objectMetadataItem.namePlural}(filter: $filter, orderBy: $orderBy, ${
    cursorDirection === 'before'
      ? 'last: $limit, before: $lastCursor'
      : 'first: $limit, after: $lastCursor'
  }, offset: $offset){
    edges {
      node ${mapObjectMetadataToGraphQLQuery({
        objectMetadataItems,
        objectMetadataItem,
        recordGqlFields,
        computeReferences,
        objectPermissionsByObjectMetadataId,
        readableRelationsWithArguments,
      })}
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
`;
