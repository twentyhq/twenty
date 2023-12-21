import { gql } from '@apollo/client';

import { useMapFieldMetadataToGraphQLQuery } from '@/object-metadata/hooks/useMapFieldMetadataToGraphQLQuery';
import { EMPTY_MUTATION } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { capitalize } from '~/utils/string/capitalize';

export const getExecuteQuickActionOnOneRecordMutationGraphQLField = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  return `executeQuickActionOn${capitalize(objectNameSingular)}`;
};

export const useGenerateExecuteQuickActionOnOneRecordMutation = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const mapFieldMetadataToGraphQLQuery = useMapFieldMetadataToGraphQLQuery();

  if (!objectMetadataItem) {
    return EMPTY_MUTATION;
  }

  const capitalizedObjectName = capitalize(objectMetadataItem.nameSingular);

  const graphQLFieldForExecuteQuickActionOnOneRecordMutation =
    getExecuteQuickActionOnOneRecordMutationGraphQLField({
      objectNameSingular: objectMetadataItem.nameSingular,
    });

  return gql`
    mutation ExecuteQuickActionOnOne${capitalizedObjectName}($idToExecuteQuickActionOn: ID!)  {
       ${graphQLFieldForExecuteQuickActionOnOneRecordMutation}(id: $idToExecuteQuickActionOn) {
        id
        ${objectMetadataItem.fields
          .map((field) => mapFieldMetadataToGraphQLQuery(field))
          .join('\n')}
      }
    }
  `;
};
