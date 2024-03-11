import { gql } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { EMPTY_MUTATION } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { isNullable } from '~/utils/isNullable';
import { capitalize } from '~/utils/string/capitalize';

export const getUpdateOneRecordMutationResponseField = (
  objectNameSingular: string,
) => `update${capitalize(objectNameSingular)}`;

export const useGenerateUpdateOneRecordMutation = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState());

  if (isNullable(objectMetadataItem)) {
    return EMPTY_MUTATION;
  }

  const capitalizedObjectName = capitalize(objectMetadataItem.nameSingular);

  const mutationResponseField = getUpdateOneRecordMutationResponseField(
    objectMetadataItem.nameSingular,
  );

  return gql`
    mutation UpdateOne${capitalizedObjectName}($idToUpdate: ID!, $input: ${capitalizedObjectName}UpdateInput!)  {
       ${mutationResponseField}(id: $idToUpdate, data: $input) ${mapObjectMetadataToGraphQLQuery(
         {
           objectMetadataItems,
           objectMetadataItem,
         },
       )}
    }
  `;
};
