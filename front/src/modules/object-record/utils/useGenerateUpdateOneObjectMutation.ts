import { gql } from '@apollo/client';

import { useMapFieldMetadataToGraphQLQuery } from '@/object-metadata/hooks/useMapFieldMetadataToGraphQLQuery';
import { EMPTY_MUTATION } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { capitalize } from '~/utils/string/capitalize';

export const getUpdateOneObjectMutationGraphQLField = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  return `update${capitalize(objectNameSingular)}`;
};

export const useGenerateUpdateOneObjectMutation = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem | undefined | null;
}) => {
  const mapFieldMetadataToGraphQLQuery = useMapFieldMetadataToGraphQLQuery();

  if (!objectMetadataItem) {
    return EMPTY_MUTATION;
  }

  const capitalizedObjectName = capitalize(objectMetadataItem.nameSingular);

  const graphQLFieldForUpdateOneObjectMutation =
    getUpdateOneObjectMutationGraphQLField({
      objectNameSingular: objectMetadataItem.nameSingular,
    });

  return gql`
    mutation UpdateOne${capitalizedObjectName}($idToUpdate: ID!, $input: ${capitalizedObjectName}UpdateInput!)  {
       ${graphQLFieldForUpdateOneObjectMutation}(id: $idToUpdate, data: $input) {
        id
        ${objectMetadataItem.fields
          .map((field) => mapFieldMetadataToGraphQLQuery(field))
          .join('\n')}
      }
    }
  `;
};
