import gql from 'graphql-tag';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { RecordGqlOperationFields } from '@/object-record/graphql-operations/types/RecordGqlOperationFields';
import { capitalize } from '~/utils/string/capitalize';

export const generateFindManyRecordsQuery = ({
  objectMetadataItem,
  objectMetadataItems,
  operationFields,
  computeReferences,
}: {
  objectMetadataItem: ObjectMetadataItem;
  objectMetadataItems: ObjectMetadataItem[];
  operationFields?: RecordGqlOperationFields;
  computeReferences?: boolean;
}) => gql`
query FindMany${capitalize(
  objectMetadataItem.namePlural,
)}($filter: ${capitalize(
  objectMetadataItem.nameSingular,
)}FilterInput, $orderBy: ${capitalize(
  objectMetadataItem.nameSingular,
)}OrderByInput, $lastCursor: String, $limit: Int) {
  ${
    objectMetadataItem.namePlural
  }(filter: $filter, orderBy: $orderBy, first: $limit, after: $lastCursor){
    edges {
      node ${mapObjectMetadataToGraphQLQuery({
        objectMetadataItems,
        objectMetadataItem,
        operationFields,
        computeReferences,
      })}
      cursor
    }
    pageInfo {
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
  }
}
`;
