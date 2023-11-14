import { gql } from '@apollo/client';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapFieldMetadataToGraphQLQuery } from '@/object-metadata/utils/mapFieldMetadataToGraphQLQuery';
import { capitalize } from '~/utils/string/capitalize';

export const generateFindManyCustomObjectsQuery = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  return gql`
    query FindMany${capitalize(
      objectMetadataItem.namePlural,
    )}($filter: ${capitalize(
    objectMetadataItem.nameSingular,
  )}FilterInput, $orderBy: ${capitalize(
    objectMetadataItem.nameSingular,
  )}OrderByInput, $lastCursor: String) {
      ${
        objectMetadataItem.namePlural
      }(filter: $filter, orderBy: $orderBy, first: 30, after: $lastCursor){
        edges {
          node {
            id
            ${objectMetadataItem.fields
              .map(mapFieldMetadataToGraphQLQuery)
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
