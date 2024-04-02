import { gql } from '@apollo/client';

import { EMPTY_MUTATION } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';
import { capitalize } from '~/utils/string/capitalize';

export const getDeleteOneRecordMutationResponseField = (
  objectNameSingular: string,
) => `delete${capitalize(objectNameSingular)}`;

export const generateDeleteOneRecordMutation = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  if (isUndefinedOrNull(objectMetadataItem)) {
    return EMPTY_MUTATION;
  }

  const capitalizedObjectName = capitalize(objectMetadataItem.nameSingular);

  const mutationResponseField = getDeleteOneRecordMutationResponseField(
    objectMetadataItem.nameSingular,
  );

  return gql`
    mutation DeleteOne${capitalizedObjectName}($idToDelete: ID!)  {
      ${mutationResponseField}(id: $idToDelete) {
        id
      }
    }
  `;
};
