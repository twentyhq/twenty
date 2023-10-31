import { gql } from '@apollo/client';

import { capitalize } from '~/utils/string/capitalize';

import { MetadataObject } from '../types/MetadataObject';

import { mapFieldMetadataToGraphQLQuery } from './mapFieldMetadataToGraphQLQuery';

export const generateFindManyCustomObjectsQuery = ({
  metadataObject,
  _fromCursor,
}: {
  metadataObject: MetadataObject;
  _fromCursor?: string;
}) => {
  return gql`
    query FindMany${metadataObject.namePlural}($filter: ${capitalize(
    metadataObject.nameSingular,
  )}FilterInput, $orderBy: ${capitalize(metadataObject.nameSingular)}OrderBy) {
      ${metadataObject.namePlural}(filter: $filter, orderBy: $orderBy){
        edges {
          node {
            id
            ${metadataObject.fields
              .map(mapFieldMetadataToGraphQLQuery)
              .join('\n')}
          }
          cursor
        }
      }
    }
  `;
};
