import gql from 'graphql-tag';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { EMPTY_MUTATION } from '@/object-record/constants/EmptyMutation';
import { getUpdateManyRecordsMutationResponseField } from '@/object-record/utils/getUpdateManyRecordsMutationResponseField';
import { capitalize } from 'twenty-shared/utils';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useUpdateManyRecordsMutation = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  if (isUndefinedOrNull(objectMetadataItem)) {
    return { updateManyRecordsMutation: EMPTY_MUTATION };
  }

  const capitalizedObjectName = capitalize(objectMetadataItem.namePlural);

  const mutationResponseField = getUpdateManyRecordsMutationResponseField(
    objectMetadataItem.namePlural,
  );

  const updateManyRecordsMutation = gql`
    mutation UpdateMany${capitalizedObjectName}($filter: ${capitalize(
      objectMetadataItem.nameSingular,
    )}FilterInput!, $data: ${capitalize(objectMetadataItem.nameSingular)}UpdateInput!) {
      ${mutationResponseField}(filter: $filter, data: $data) {
        id
      }
    }
  `;

  return { updateManyRecordsMutation };
};
