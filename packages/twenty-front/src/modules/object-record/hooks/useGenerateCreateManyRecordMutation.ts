import { gql } from '@apollo/client';

import { useMapFieldMetadataToGraphQLQuery } from '@/object-metadata/hooks/useMapFieldMetadataToGraphQLQuery';
import { EMPTY_MUTATION } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isNullable } from '~/utils/isNullable';
import { capitalize } from '~/utils/string/capitalize';

export const getCreateManyRecordsMutationResponseField = (
  objectNamePlural: string,
) => `create${capitalize(objectNamePlural)}`;

export const useGenerateCreateManyRecordMutation = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const mapFieldMetadataToGraphQLQuery = useMapFieldMetadataToGraphQLQuery();

  if (isNullable(objectMetadataItem)) {
    return EMPTY_MUTATION;
  }

  const mutationResponseField = getCreateManyRecordsMutationResponseField(
    objectMetadataItem.namePlural,
  );

  return gql`
    mutation Create${capitalize(
      objectMetadataItem.namePlural,
    )}($data: [${capitalize(objectMetadataItem.nameSingular)}CreateInput!]!)  {
      ${mutationResponseField}(data: $data) { 
        id
        ${objectMetadataItem.fields
          .map((field) =>
            mapFieldMetadataToGraphQLQuery({
              field,
            }),
          )
          .join('\n')}
    }
  }`;
};
