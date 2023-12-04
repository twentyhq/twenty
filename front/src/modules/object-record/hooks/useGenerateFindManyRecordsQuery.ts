import { gql } from '@apollo/client';

import { useMapFieldMetadataToGraphQLQuery } from '@/object-metadata/hooks/useMapFieldMetadataToGraphQLQuery';
import { EMPTY_QUERY } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { capitalize } from '~/utils/string/capitalize';

export const useGenerateFindManyRecordsQuery = ({
  objectMetadataItem,
  depth,
}: {
  objectMetadataItem: ObjectMetadataItem;
  depth?: number;
}) => {
  const mapFieldMetadataToGraphQLQuery = useMapFieldMetadataToGraphQLQuery();

  if (!objectMetadataItem) {
    return EMPTY_QUERY;
  }

  return gql`
    query FindMany${capitalize(
      objectMetadataItem.namePlural,
    )}($filter: ${capitalize(
      objectMetadataItem.nameSingular,
    )}FilterInput, $orderBy: ${capitalize(
      objectMetadataItem.nameSingular,
    )}OrderByInput, $lastCursor: String, $limit: Float = 30) {
      ${
        objectMetadataItem.namePlural
      }(filter: $filter, orderBy: $orderBy, first: $limit, after: $lastCursor){
        edges {
          node {
            id
            ${objectMetadataItem.fields
              .map((field) => mapFieldMetadataToGraphQLQuery(field, depth))
              .join('\n')}
          }
          cursor
        }
        pageInfo {
          hasNextPage
          startCursor
          endCursor
        }
      }
    }
  `;
};
