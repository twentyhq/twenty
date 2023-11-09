import { gql } from '@apollo/client';

import { capitalize } from '~/utils/string/capitalize';

import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

export const generateDeleteOneObjectMutation = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const capitalizedObjectName = capitalize(objectMetadataItem.nameSingular);

  return gql`
    mutation DeleteOne${capitalizedObjectName}($idToDelete: ID!)  {
      delete${capitalizedObjectName}(id: $idToDelete) {
        id
      }
    }
  `;
};
