import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';
import { getSettingsFieldTypeConfig } from '@/settings/data-model/utils/getSettingsFieldTypeConfig';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const getFieldPreviewValue = ({
  fieldMetadataItem,
}: {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'type' | 'defaultValue' | 'settings'
  >;
}) => {
  if (fieldMetadataItem.defaultValue !== undefined && fieldMetadataItem.defaultValue !== null) {
    return fieldMetadataItem.defaultValue;
  }

  const fieldTypeConfig = getSettingsFieldTypeConfig(fieldMetadataItem.type as SettingsFieldType);
  
  if (fieldMetadataItem.type === FieldMetadataType.Number) {
    return fieldTypeConfig.exampleValue || 2000;
  }

  return fieldTypeConfig.exampleValue ?? null;
};
