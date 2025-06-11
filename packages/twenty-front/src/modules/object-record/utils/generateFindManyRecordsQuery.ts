import gql from 'graphql-tag';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { capitalize } from 'twenty-shared/utils';
import { ObjectPermission } from '~/generated-metadata/graphql';

export type QueryCursorDirection = 'before' | 'after';

export const generateFindManyRecordsQuery = ({
  objectMetadataItem,
  objectMetadataItems,
  recordGqlFields,
  computeReferences,
  cursorDirection,
  objectPermissionsByObjectMetadataId,
}: {
  objectMetadataItem: ObjectMetadataItem;
  objectMetadataItems: ObjectMetadataItem[];
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
  computeReferences?: boolean;
  cursorDirection?: QueryCursorDirection;
  objectPermissionsByObjectMetadataId: Record<string, ObjectPermission>;
}) => gql`
query FindMany${capitalize(
  objectMetadataItem.namePlural,
)}($filter: ${capitalize(
  objectMetadataItem.nameSingular,
)}FilterInput, $orderBy: [${capitalize(
  objectMetadataItem.nameSingular,
)}OrderByInput], $lastCursor: String, $limit: Int) {
  ${objectMetadataItem.namePlural}(filter: $filter, orderBy: $orderBy, ${
    cursorDirection === 'before'
      ? 'last: $limit, before: $lastCursor'
      : 'first: $limit, after: $lastCursor'
  } ){
    edges {
      node ${mapObjectMetadataToGraphQLQuery({
        objectMetadataItems,
        objectMetadataItem,
        recordGqlFields,
        computeReferences,
        objectPermissionsByObjectMetadataId,
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
