import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const DEFAULT_LABEL_IDENTIFIER_FIELD_NAME = 'name';

export const isLabelIdentifierField = ({
  fieldMetadataItem,
  objectMetadataItem,
}: {
  fieldMetadataItem: Pick<FieldMetadataItem, 'id' | 'name'>;
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'labelIdentifierFieldMetadataId'
  >;
}) => {
  return isDefined(objectMetadataItem.labelIdentifierFieldMetadataId)
    ? fieldMetadataItem.id === objectMetadataItem.labelIdentifierFieldMetadataId
    : fieldMetadataItem.name === DEFAULT_LABEL_IDENTIFIER_FIELD_NAME;
};
