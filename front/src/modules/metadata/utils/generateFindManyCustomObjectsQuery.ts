import { gql } from '@apollo/client';

import { capitalize } from '~/utils/string/capitalize';

import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

import { mapFieldMetadataToGraphQLQuery } from './mapFieldMetadataToGraphQLQuery';

export const generateFindManyCustomObjectsQuery = ({
  ObjectMetadataItem,
  _fromCursor,
}: {
  ObjectMetadataItem: ObjectMetadataItem;
  _fromCursor?: string;
}) => {
  return gql`
    query FindMany${ObjectMetadataItem.namePlural}($filter: ${capitalize(
    ObjectMetadataItem.nameSingular,
  )}FilterInput, $orderBy: ${capitalize(
    ObjectMetadataItem.nameSingular,
  )}OrderBy) {
      ${ObjectMetadataItem.namePlural}(filter: $filter, orderBy: $orderBy){
        edges {
          node {
            id
            ${ObjectMetadataItem.fields
              .map(mapFieldMetadataToGraphQLQuery)
              .join('\n')}
          }
          cursor
        }
      }
    }
  `;
};
