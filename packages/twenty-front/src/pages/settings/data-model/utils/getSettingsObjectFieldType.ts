import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getIsMetadataItemCustom } from '@/object-metadata/utils/getIsMetadataItemCustom';
import { getFieldIdentifierType } from '@/settings/data-model/utils/getFieldIdentifierType';
import { isDefined } from 'twenty-shared/utils';

export const getSettingsObjectFieldType = (
  objectMetadataItem: EnrichedObjectMetadataItem,
  fieldMetadataItem: FieldMetadataItem,
  workspaceCustomApplicationId?: string | null,
) => {
  const variant = getIsMetadataItemCustom(
    objectMetadataItem,
    workspaceCustomApplicationId,
  )
    ? 'identifier'
    : 'field-type';

  const identifierType = getFieldIdentifierType(
    fieldMetadataItem,
    objectMetadataItem,
  );

  if (variant === 'field-type') {
    return objectMetadataItem.isRemote
      ? 'Remote'
      : getIsMetadataItemCustom(fieldMetadataItem, workspaceCustomApplicationId)
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
