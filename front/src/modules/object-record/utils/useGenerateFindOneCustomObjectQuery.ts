import { gql } from '@apollo/client';

import { EMPTY_QUERY } from '@/object-metadata/hooks/useFindOneObjectMetadataItem';
import { useMapFieldMetadataToGraphQLQuery } from '@/object-metadata/hooks/useMapFieldMetadataToGraphQLQuery';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const useGenerateFindOneCustomObjectQuery = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem | null | undefined;
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
          .map(mapFieldMetadataToGraphQLQuery)
          .join('\n')}
      }
    }
  `;
};
