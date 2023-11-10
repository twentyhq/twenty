import { gql } from '@apollo/client';

import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

import { mapFieldMetadataToGraphQLQuery } from './mapFieldMetadataToGraphQLQuery';

export const generateFindOneCustomObjectQuery = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  return gql`
    query FindOne${objectMetadataItem.nameSingular}($objectMetadataId: UUID!) {
      ${objectMetadataItem.nameSingular}(filter: {
        id: {
          eq: $objectMetadataId
        }
      }){
        id
        ${objectMetadataItem.fields
          .map(mapFieldMetadataToGraphQLQuery)
          .join('\n')}
      }
    }
  `;
};
