import gql from 'graphql-tag';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { mapSoftDeleteFieldsToGraphQLQuery } from '@/object-metadata/utils/mapSoftDeleteFieldsToGraphQLQuery';
import { EMPTY_MUTATION } from '@/object-record/constants/EmptyMutation';
import { getDeleteOneRecordMutationResponseField } from '@/object-record/utils/getDeleteOneRecordMutationResponseField';
import { capitalize } from 'twenty-shared';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useDeleteOneRecordMutation = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  if (isUndefinedOrNull(objectMetadataItem)) {
    return { deleteOneRecordMutation: EMPTY_MUTATION };
  }

  const capitalizedObjectName = capitalize(objectMetadataItem.nameSingular);

  const mutationResponseField = getDeleteOneRecordMutationResponseField(
    objectMetadataItem.nameSingular,
  );

  const deleteOneRecordMutation = gql`
  mutation DeleteOne${capitalizedObjectName}($idToDelete: ID!) {
    ${mutationResponseField}(id: $idToDelete)
    ${mapSoftDeleteFieldsToGraphQLQuery(objectMetadataItem)}
  }
`;

  return {
    deleteOneRecordMutation,
  };
};
