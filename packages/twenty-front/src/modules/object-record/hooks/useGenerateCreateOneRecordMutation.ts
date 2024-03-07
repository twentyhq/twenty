import { gql } from '@apollo/client';

import { useMapFieldMetadataToGraphQLQuery } from '@/object-metadata/hooks/useMapFieldMetadataToGraphQLQuery';
import { EMPTY_MUTATION } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isNullable } from '~/utils/isNullable';
import { capitalize } from '~/utils/string/capitalize';

export const getCreateOneRecordMutationResponseField = (
  objectNameSingular: string,
) => `create${capitalize(objectNameSingular)}`;

export const useGenerateCreateOneRecordMutation = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const mapFieldMetadataToGraphQLQuery = useMapFieldMetadataToGraphQLQuery();

  if (isNullable(objectMetadataItem)) {
    return EMPTY_MUTATION;
  }

  const capitalizedObjectName = capitalize(objectMetadataItem.nameSingular);

  const mutationResponseField = getCreateOneRecordMutationResponseField(
    objectMetadataItem.nameSingular,
  );

  return gql`
    mutation CreateOne${capitalizedObjectName}($input: ${capitalizedObjectName}CreateInput!)  {
      ${mutationResponseField}(data: $input) {
        id
        ${objectMetadataItem.fields
          .map((field) =>
            mapFieldMetadataToGraphQLQuery({
              field,
            }),
          )
          .join('\n')}
      }
    }
  `;
};
