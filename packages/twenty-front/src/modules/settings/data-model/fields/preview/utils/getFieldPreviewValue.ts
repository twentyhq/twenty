import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';
import { getSettingsFieldTypeConfig } from '@/settings/data-model/utils/getSettingsFieldTypeConfig';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const DEFAULT_NUMBER_PREVIEW_VALUE = 2000;

export const getFieldPreviewValue = ({
  fieldMetadataItem,
}: {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'type' | 'defaultValue'
  >;
}) => {
  if (fieldMetadataItem.defaultValue !== undefined && fieldMetadataItem.defaultValue !== null) {
    return fieldMetadataItem.defaultValue;
  }

  const fieldTypeConfig = getSettingsFieldTypeConfig(fieldMetadataItem.type as SettingsFieldType);
  
  if (fieldMetadataItem.type === FieldMetadataType.Number) {
    return fieldTypeConfig.exampleValue || DEFAULT_NUMBER_PREVIEW_VALUE;
  }

  return fieldTypeConfig.exampleValue ?? null;
};
