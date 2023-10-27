import { gql } from '@apollo/client';

import { MetadataObject } from '../types/MetadataObject';

import { mapFieldMetadataToGraphQLQuery } from './mapFieldMetadataToGraphQLQuery';

export const generateFindOneCustomObjectQuery = ({
  metadataObject,
}: {
  metadataObject: MetadataObject;
}) => {
  return gql`
    query FindOne${metadataObject.nameSingular}($objectId: UUID!) {
      ${metadataObject.nameSingular}(filter: {
        id: {
          eq: $objectId
        }
      }){
        id
        ${metadataObject.fields.map(mapFieldMetadataToGraphQLQuery).join('\n')}
      }
    }
  `;
};
