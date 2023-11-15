import { gql } from '@apollo/client';

import { EMPTY_MUTATION } from '@/object-metadata/hooks/useFindOneObjectMetadataItem';
import { useMapFieldMetadataToGraphQLQuery } from '@/object-metadata/hooks/useMapFieldMetadataToGraphQLQuery';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { capitalize } from '~/utils/string/capitalize';

export const useGenerateCreateOneObjectMutation = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem | undefined | null;
}) => {
  const mapFieldMetadataToGraphQLQuery = useMapFieldMetadataToGraphQLQuery();

  if (!objectMetadataItem) {
    return EMPTY_MUTATION;
  }

  const capitalizedObjectName = capitalize(objectMetadataItem.nameSingular);

  return gql`
    mutation CreateOne${capitalizedObjectName}($input: ${capitalizedObjectName}CreateInput!)  {
      create${capitalizedObjectName}(data: $input) {
        id
        ${objectMetadataItem.fields
          .map(mapFieldMetadataToGraphQLQuery)
          .join('\n')}
      }
    }
  `;
};
