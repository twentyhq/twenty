import { gql } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { EMPTY_MUTATION } from '@/object-record/constants/EmptyMutation';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';
import { capitalize } from '~/utils/string/capitalize';

export const getExecuteQuickActionOnOneRecordMutationGraphQLField = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  return `executeQuickActionOn${capitalize(objectNameSingular)}`;
};

export const useExecuteQuickActionOnOneRecordMutation = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  if (isUndefinedOrNull(objectMetadataItem)) {
    return { executeQuickActionOnOneRecordMutation: EMPTY_MUTATION };
  }

  const capitalizedObjectName = capitalize(objectMetadataItem.nameSingular);

  const graphQLFieldForExecuteQuickActionOnOneRecordMutation =
    getExecuteQuickActionOnOneRecordMutationGraphQLField({
      objectNameSingular: objectMetadataItem.nameSingular,
    });

  const executeQuickActionOnOneRecordMutation = gql`
    mutation ExecuteQuickActionOnOne${capitalizedObjectName}($idToExecuteQuickActionOn: ID!)  {
       ${graphQLFieldForExecuteQuickActionOnOneRecordMutation}(id: $idToExecuteQuickActionOn) ${mapObjectMetadataToGraphQLQuery(
         {
           objectMetadataItems,
           objectMetadataItem,
         },
       )}
    }
  `;

  return { executeQuickActionOnOneRecordMutation };
};
