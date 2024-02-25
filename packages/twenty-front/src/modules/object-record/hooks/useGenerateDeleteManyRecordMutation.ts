import { gql } from '@apollo/client';

import { EMPTY_MUTATION } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { capitalize } from '~/utils/string/capitalize';

export const getDeleteManyRecordsMutationResponseField = (
  objectNamePlural: string,
) => `delete${capitalize(objectNamePlural)}`;

export const useGenerateDeleteManyRecordMutation = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  if (!objectMetadataItem) {
    return EMPTY_MUTATION;
  }

  const capitalizedObjectName = capitalize(objectMetadataItem.namePlural);

  const mutationResponseField = getDeleteManyRecordsMutationResponseField(
    objectMetadataItem.namePlural,
  );

  return gql`
    mutation DeleteMany${capitalizedObjectName}($filter: ${capitalize(
      objectMetadataItem.nameSingular,
    )}FilterInput!)  {
      ${mutationResponseField}(filter: $filter) {
        id
      }
    }
  `;
};
