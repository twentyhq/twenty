import gql from 'graphql-tag';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { EMPTY_MUTATION } from '@/object-record/constants/EmptyMutation';
import { getRestoreManyRecordsMutationResponseField } from '@/object-record/utils/getRestoreManyRecordsMutationResponseField';
import { capitalize } from 'twenty-shared';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useRestoreManyRecordsMutation = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  if (isUndefinedOrNull(objectMetadataItem)) {
    return { restoreManyRecordsMutation: EMPTY_MUTATION };
  }

  const capitalizedObjectName = capitalize(objectMetadataItem.namePlural);

  const mutationResponseField = getRestoreManyRecordsMutationResponseField(
    objectMetadataItem.namePlural,
  );

  const restoreManyRecordsMutation = gql`
    mutation RestoreMany${capitalizedObjectName}($filter: ${capitalize(
      objectMetadataItem.nameSingular,
    )}FilterInput!)  {
      ${mutationResponseField}(filter: $filter) {
        id
      }
    }
  `;

  return {
    restoreManyRecordsMutation,
  };
};
