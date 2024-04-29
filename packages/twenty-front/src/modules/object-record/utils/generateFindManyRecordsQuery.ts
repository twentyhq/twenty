import gql from 'graphql-tag';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { QueryFields } from '@/object-record/query-keys/types/QueryFields';
import { capitalize } from '~/utils/string/capitalize';

export const generateFindManyRecordsQuery = ({
  objectMetadataItem,
  objectMetadataItems,
  depth,
  queryFields,
  computeReferences,
}: {
  objectMetadataItem: ObjectMetadataItem;
  objectMetadataItems: ObjectMetadataItem[];
  queryFields?: QueryFields;
  depth?: number;
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
        depth,
        queryFields,
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
