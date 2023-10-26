import { gql } from '@apollo/client';

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
    query FindMany${metadataObject.namePlural} {
      ${metadataObject.namePlural}{
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
