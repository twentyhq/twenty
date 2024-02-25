import { gql } from '@apollo/client';

import { useMapFieldMetadataToGraphQLQuery } from '@/object-metadata/hooks/useMapFieldMetadataToGraphQLQuery';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const useGenerateFindOneRecordQuery = () => {
  const mapFieldMetadataToGraphQLQuery = useMapFieldMetadataToGraphQLQuery();

  return ({
    objectMetadataItem,
    depth,
  }: {
    objectMetadataItem: Pick<ObjectMetadataItem, 'nameSingular' | 'fields'>;
    depth?: number;
  }) => {
    return gql`
      query FindOne${objectMetadataItem.nameSingular}($objectRecordId: UUID!) {
        ${objectMetadataItem.nameSingular}(filter: {
          id: {
            eq: $objectRecordId
          }
        }){
          id
          ${objectMetadataItem.fields
            .map((field) =>
              mapFieldMetadataToGraphQLQuery({
                field,
                maxDepthForRelations: depth,
              }),
            )
            .join('\n')}
        }
      }
  `;
  };
};
