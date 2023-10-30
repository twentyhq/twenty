import { gql } from '@apollo/client';

import { capitalize } from '~/utils/string/capitalize';

import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

export const generateUpdateOneObjectMutation = ({
  ObjectMetadataItem,
}: {
  ObjectMetadataItem: ObjectMetadataItem;
}) => {
  const capitalizedObjectName = capitalize(ObjectMetadataItem.nameSingular);

  return gql`
    mutation UpdateOne${capitalizedObjectName}($idToUpdate: ID!, $input: ${capitalizedObjectName}UpdateInput!)  {
       updateOne${capitalizedObjectName}(id: $idToUpdate, data: $input) {
        id
      }
    }
  `;
};
