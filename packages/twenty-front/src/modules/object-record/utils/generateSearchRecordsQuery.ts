import gql from 'graphql-tag';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { getSearchRecordsQueryResponseField } from '@/object-record/utils/getSearchRecordsQueryResponseField';
import { capitalize } from 'twenty-shared';

export type QueryCursorDirection = 'before' | 'after';

export const generateSearchRecordsQuery = ({
  objectMetadataItem,
  objectMetadataItems,
  recordGqlFields,
  computeReferences,
}: {
  objectMetadataItem: ObjectMetadataItem;
  objectMetadataItems: ObjectMetadataItem[];
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
  computeReferences?: boolean;
}) => gql`
    query Search${capitalize(objectMetadataItem.namePlural)}($search: String, $limit: Int, $filter: ${capitalize(
      objectMetadataItem.nameSingular,
    )}FilterInput) {
  ${getSearchRecordsQueryResponseField(objectMetadataItem.namePlural)}(searchInput: $search, limit: $limit, filter: $filter){
    edges {
      node ${mapObjectMetadataToGraphQLQuery({
        objectMetadataItems,
        objectMetadataItem,
        recordGqlFields,
        computeReferences,
      })}
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
`;
