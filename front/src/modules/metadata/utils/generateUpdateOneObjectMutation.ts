import { gql } from '@apollo/client';

import { capitalize } from '~/utils/string/capitalize';

import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

import { mapFieldMetadataToGraphQLQuery } from './mapFieldMetadataToGraphQLQuery';

export const getUpdateOneObjectMutationGraphQLField = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  return `update${capitalize(objectNameSingular)}`;
};

export const generateUpdateOneObjectMutation = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
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
          .map(mapFieldMetadataToGraphQLQuery)
          .join('\n')}
      }
    }
  `;
};
