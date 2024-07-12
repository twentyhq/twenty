import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from '~/utils/isDefined';

export const DEFAULT_LABEL_IDENTIFIER_FIELD_NAME = 'name';

export const isLabelIdentifierField = ({
  fieldMetadataItem,
  objectMetadataItem,
}: {
  fieldMetadataItem: Pick<FieldMetadataItem, 'id' | 'name'>;
  objectMetadataItem: Pick<
    ObjectMetadataItem,
    'labelIdentifierFieldMetadataId' | 'nameSingular'
  >;
}) => {
  // Temporary hack while waiting for Weiko's PR
  // https://github.com/twentyhq/twenty/pull/6227
  if (
    objectMetadataItem.nameSingular === 'activity' &&
    fieldMetadataItem.name === 'title'
  ) {
    return true;
  }

  return isDefined(objectMetadataItem.labelIdentifierFieldMetadataId)
    ? fieldMetadataItem.id === objectMetadataItem.labelIdentifierFieldMetadataId
    : fieldMetadataItem.name === DEFAULT_LABEL_IDENTIFIER_FIELD_NAME;
};
