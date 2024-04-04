import { gql } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { EMPTY_MUTATION } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';
import { capitalize } from '~/utils/string/capitalize';

export const getExecuteQuickActionOnOneRecordMutationGraphQLField = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  return `executeQuickActionOn${capitalize(objectNameSingular)}`;
};

export const useGenerateExecuteQuickActionOnOneRecordMutation = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  if (isUndefinedOrNull(objectMetadataItem)) {
    return EMPTY_MUTATION;
  }

  const capitalizedObjectName = capitalize(objectMetadataItem.nameSingular);

  const graphQLFieldForExecuteQuickActionOnOneRecordMutation =
    getExecuteQuickActionOnOneRecordMutationGraphQLField({
      objectNameSingular: objectMetadataItem.nameSingular,
    });

  return gql`
    mutation ExecuteQuickActionOnOne${capitalizedObjectName}($idToExecuteQuickActionOn: ID!)  {
       ${graphQLFieldForExecuteQuickActionOnOneRecordMutation}(id: $idToExecuteQuickActionOn) ${mapObjectMetadataToGraphQLQuery(
         {
           objectMetadataItems,
           objectMetadataItem,
         },
       )}
    }
  `;
};
