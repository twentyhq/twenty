import { gql } from '@apollo/client';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { capitalize } from '~/utils/string/capitalize';

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
