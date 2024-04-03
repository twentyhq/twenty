import { gql } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { EMPTY_MUTATION } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';
import { capitalize } from '~/utils/string/capitalize';

export const getCreateOneRecordMutationResponseField = (
  objectNameSingular: string,
) => `create${capitalize(objectNameSingular)}`;

export const useGenerateCreateOneRecordMutation = ({
  objectMetadataItem,
  queryFields,
  depth = 1,
}: {
  objectMetadataItem: ObjectMetadataItem;
  queryFields?: Record<string, any>;
  depth?: number;
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  if (isUndefinedOrNull(objectMetadataItem)) {
    return EMPTY_MUTATION;
  }

  const capitalizedObjectName = capitalize(objectMetadataItem.nameSingular);

  const mutationResponseField = getCreateOneRecordMutationResponseField(
    objectMetadataItem.nameSingular,
  );

  return gql`
    mutation CreateOne${capitalizedObjectName}($input: ${capitalizedObjectName}CreateInput!)  {
      ${mutationResponseField}(data: $input) ${mapObjectMetadataToGraphQLQuery({
        objectMetadataItems,
        objectMetadataItem,
        queryFields,
        depth,
      })}
    }
  `;
};
