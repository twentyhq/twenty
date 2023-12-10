import { gql } from '@apollo/client';

import { useMapFieldMetadataToGraphQLQuery } from '@/object-metadata/hooks/useMapFieldMetadataToGraphQLQuery';
import { EMPTY_MUTATION } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { capitalize } from '~/utils/string/capitalize';

export const useGenerateCreateOneRecordMutation = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
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
          .map((field) => mapFieldMetadataToGraphQLQuery(field))
          .join('\n')}
      }
    }
  `;
};
