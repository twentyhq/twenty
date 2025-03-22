import gql from 'graphql-tag';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { EMPTY_MUTATION } from '@/object-record/constants/EmptyMutation';
import { getDeleteManyRecordsMutationResponseField } from '@/object-record/utils/getDeleteManyRecordsMutationResponseField';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';
import { capitalize } from 'twenty-shared/utils';

export const useDeleteManyRecordsMutation = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  if (isUndefinedOrNull(objectMetadataItem)) {
    return { deleteManyRecordsMutation: EMPTY_MUTATION };
  }

  const capitalizedObjectName = capitalize(objectMetadataItem.namePlural);

  const mutationResponseField = getDeleteManyRecordsMutationResponseField(
    objectMetadataItem.namePlural,
  );

  const deleteManyRecordsMutation = gql`
    mutation DeleteMany${capitalizedObjectName}($filter: ${capitalize(
      objectMetadataItem.nameSingular,
    )}FilterInput!)  {
      ${mutationResponseField}(filter: $filter) {
        id
      }
    }
  `;

  return {
    deleteManyRecordsMutation,
  };
};
