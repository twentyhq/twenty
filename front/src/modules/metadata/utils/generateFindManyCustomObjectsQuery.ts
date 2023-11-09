import { gql } from '@apollo/client';

import { capitalize } from '~/utils/string/capitalize';

import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

import { mapFieldMetadataToGraphQLQuery } from './mapFieldMetadataToGraphQLQuery';

export const generateFindManyCustomObjectsQuery = ({
  objectMetadataItem,
  _fromCursor,
}: {
  objectMetadataItem: ObjectMetadataItem;
  _fromCursor?: string;
}) => {
  return gql`
    query FindMany${objectMetadataItem.namePlural}($filter: ${capitalize(
    objectMetadataItem.nameSingular,
  )}FilterInput, $orderBy: ${capitalize(
    objectMetadataItem.nameSingular,
  )}OrderByInput) {
      ${objectMetadataItem.namePlural}(filter: $filter, orderBy: $orderBy){
        edges {
          node {
            id
            ${objectMetadataItem.fields
              .map(mapFieldMetadataToGraphQLQuery)
              .join('\n')}
          }
          cursor
        }
      }
    }
  `;
};
