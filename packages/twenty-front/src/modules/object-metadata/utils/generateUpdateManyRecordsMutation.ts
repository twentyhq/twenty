import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getUpdateManyRecordsMutationResponseField } from '@/object-record/utils/getUpdateManyRecordsMutationResponseField';
import { gql } from '@apollo/client';
import { capitalize } from 'twenty-shared/utils';

export const generateUpdateManyRecordsMutation = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const capitalizedObjectNameSingular = capitalize(
    objectMetadataItem.nameSingular,
  );
  const capitalizedObjectNamePlural = capitalize(objectMetadataItem.namePlural);

  const mutationResponseField = getUpdateManyRecordsMutationResponseField(
    objectMetadataItem.namePlural,
  );

  const updateManyRecordsMutation = gql`
    mutation UpdateMany${capitalizedObjectNamePlural}($filter: ${capitalizedObjectNameSingular}FilterInput!, $data: ${capitalizedObjectNameSingular}UpdateInput!) {
      ${mutationResponseField}(filter: $filter, data: $data) {
        id
      }
    }
  `;

  return updateManyRecordsMutation;
};
