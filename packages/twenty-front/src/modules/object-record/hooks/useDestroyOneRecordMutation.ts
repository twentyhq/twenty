import gql from 'graphql-tag';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { EMPTY_MUTATION } from '@/object-record/constants/EmptyMutation';
import { getDestroyOneRecordMutationResponseField } from '@/object-record/utils/getDestroyOneRecordMutationResponseField';
import { capitalize } from 'twenty-shared';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useDestroyOneRecordMutation = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  if (isUndefinedOrNull(objectMetadataItem)) {
    return { destroyOneRecordMutation: EMPTY_MUTATION };
  }

  const capitalizedObjectName = capitalize(objectMetadataItem.nameSingular);

  const mutationResponseField = getDestroyOneRecordMutationResponseField(
    objectMetadataItem.nameSingular,
  );

  const destroyOneRecordMutation = gql`
    mutation DestroyOne${capitalizedObjectName}($idToDestroy: ID!)  {
      ${mutationResponseField}(id: $idToDestroy) {
        id
      }
    }
  `;

  return {
    destroyOneRecordMutation,
  };
};
