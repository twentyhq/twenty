import { gql } from '@apollo/client';

import { EMPTY_MUTATION } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { capitalize } from '~/utils/string/capitalize';

export const generateDeleteOneRecordMutation = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  if (!objectMetadataItem) {
    return EMPTY_MUTATION;
  }

  const capitalizedObjectName = capitalize(objectMetadataItem.nameSingular);

  return gql`
    mutation DeleteOne${capitalizedObjectName}($idToDelete: ID!)  {
      delete${capitalizedObjectName}(id: $idToDelete) {
        id
      }
    }
  `;
};
