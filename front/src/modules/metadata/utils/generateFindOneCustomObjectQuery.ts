import { gql } from '@apollo/client';

import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

import { mapFieldMetadataToGraphQLQuery } from './mapFieldMetadataToGraphQLQuery';

export const generateFindOneCustomObjectQuery = ({
  ObjectMetadataItem,
}: {
  ObjectMetadataItem: ObjectMetadataItem;
}) => {
  return gql`
    query FindOne${ObjectMetadataItem.nameSingular}($objectId: UUID!) {
      ${ObjectMetadataItem.nameSingular}(filter: {
        id: {
          eq: $objectId
        }
      }){
        id
        ${ObjectMetadataItem.fields.map(mapFieldMetadataToGraphQLQuery).join('\n')}
      }
    }
  `;
};
