import { gql } from '@apollo/client';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapFieldMetadataToGraphQLQuery } from '@/object-metadata/utils/mapFieldMetadataToGraphQLQuery';
import { capitalize } from '~/utils/string/capitalize';

export const generateCreateOneObjectMutation = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
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
