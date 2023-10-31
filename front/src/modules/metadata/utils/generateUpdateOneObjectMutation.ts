import { gql } from '@apollo/client';

import { capitalize } from '~/utils/string/capitalize';

import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

export const generateUpdateOneObjectMutation = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const capitalizedObjectName = capitalize(objectMetadataItem.nameSingular);

  return gql`
    mutation UpdateOne${capitalizedObjectName}($idToUpdate: ID!, $input: ${capitalizedObjectName}UpdateInput!)  {
       updateOne${capitalizedObjectName}(id: $idToUpdate, data: $input) {
        id
      }
    }
  `;
};
