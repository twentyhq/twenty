import { gql } from '@apollo/client';

import { useMapFieldMetadataToGraphQLQuery } from '@/object-metadata/hooks/useMapFieldMetadataToGraphQLQuery';
import { EMPTY_QUERY } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const useGenerateFindOneRecordQuery = ({
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
    query FindOne${objectMetadataItem.nameSingular}($objectRecordId: UUID!) {
      ${objectMetadataItem.nameSingular}(filter: {
        id: {
          eq: $objectRecordId
        }
      }){
        id
        ${objectMetadataItem.fields
          .map((field) => mapFieldMetadataToGraphQLQuery(field, depth))
          .join('\n')}
      }
    }
  `;
};
