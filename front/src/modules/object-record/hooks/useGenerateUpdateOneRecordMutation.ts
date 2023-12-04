import { gql } from '@apollo/client';

import { useMapFieldMetadataToGraphQLQuery } from '@/object-metadata/hooks/useMapFieldMetadataToGraphQLQuery';
import { EMPTY_MUTATION } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { capitalize } from '~/utils/string/capitalize';

export const getUpdateOneRecordMutationGraphQLField = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  return `update${capitalize(objectNameSingular)}`;
};

export const useGenerateUpdateOneRecordMutation = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const mapFieldMetadataToGraphQLQuery = useMapFieldMetadataToGraphQLQuery();

  if (!objectMetadataItem) {
    return EMPTY_MUTATION;
  }

  const capitalizedObjectName = capitalize(objectMetadataItem.nameSingular);

  const graphQLFieldForUpdateOneRecordMutation =
    getUpdateOneRecordMutationGraphQLField({
      objectNameSingular: objectMetadataItem.nameSingular,
    });

  return gql`
    mutation UpdateOne${capitalizedObjectName}($idToUpdate: ID!, $input: ${capitalizedObjectName}UpdateInput!)  {
       ${graphQLFieldForUpdateOneRecordMutation}(id: $idToUpdate, data: $input) {
        id
        ${objectMetadataItem.fields
          .map((field) => mapFieldMetadataToGraphQLQuery(field))
          .join('\n')}
      }
    }
  `;
};
