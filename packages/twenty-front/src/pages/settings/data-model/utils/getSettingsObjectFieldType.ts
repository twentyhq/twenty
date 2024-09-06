import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getFieldIdentifierType } from '@/settings/data-model/utils/getFieldIdentifierType';
import { isDefined } from 'twenty-ui';

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
      ? 'Remoto'
      : fieldMetadataItem.isCustom
        ? 'Custom'
        : 'Padrão';
  } else {
    return isDefined(identifierType)
      ? identifierType === 'label'
        ? 'Texto do registro'
        : 'Imagem do registro'
      : null;
  }
};
