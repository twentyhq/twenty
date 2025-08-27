import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getFieldIdentifierType } from '@/settings/data-model/utils/getFieldIdentifierType';
import { isDefined } from 'twenty-shared/utils';

export const getSettingsObjectFieldType = (
  objectMetadataItem: ObjectMetadataItem,
  fieldMetadataItem: FieldMetadataItem,
) => {
  const variant = objectMetadataItem.isCustom ? 'identifier' : 'field-type';

  const identifierType = getFieldIdentifierType(
    fieldMetadataItem,
    objectMetadataItem,
  );

  if (variant === 'field-type') {
    return objectMetadataItem.isRemote
      ? 'Remote'
      : fieldMetadataItem.isCustom
        ? 'Custom'
        : 'Standard';
  } else {
    return isDefined(identifierType)
      ? identifierType === 'label'
        ? 'Record text'
        : 'Record image'
      : null;
  }
};
