import { gql } from '@apollo/client';

import { useMapFieldMetadataToGraphQLQuery } from '@/object-metadata/hooks/useMapFieldMetadataToGraphQLQuery';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { capitalize } from '~/utils/string/capitalize';

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
      query FindOne${capitalize(
        objectMetadataItem.nameSingular,
      )}($objectRecordId: UUID!) {
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
                depth,
              }),
            )
            .join('\n')}
        }
      }
  `;
  };
};
