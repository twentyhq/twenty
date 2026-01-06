import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getImageIdentifierFieldMetadataItem } from '@/object-metadata/utils/getImageIdentifierFieldMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { type RecordGqlFields } from '@/object-record/graphql/record-gql-fields/types/RecordGqlFields';
import { isDefined } from 'twenty-shared/utils';

// Build identifier fields (id, label, image) for an object
export const buildIdentifierGqlFields = (
  objectMetadata: Pick<
    ObjectMetadataItem,
    'fields' | 'labelIdentifierFieldMetadataId'
  >,
): RecordGqlFields => {
  const labelIdentifierField =
    getLabelIdentifierFieldMetadataItem(objectMetadata);
  const imageIdentifierField =
    getImageIdentifierFieldMetadataItem(objectMetadata);

  return {
    id: true,
    ...(isDefined(labelIdentifierField) && {
      [labelIdentifierField.name]: true,
    }),
    ...(isDefined(imageIdentifierField) && {
      [imageIdentifierField.name]: true,
    }),
  };
};

