import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getSettingsFieldTypeConfig } from '@/settings/data-model/utils/getSettingsFieldTypeConfig';

export const getFieldPreviewValue = ({
  fieldMetadataItem,
}: {
  fieldMetadataItem: Pick<FieldMetadataItem, 'type' | 'defaultValue'>;
}) =>
  fieldMetadataItem.defaultValue ??
  getSettingsFieldTypeConfig(fieldMetadataItem.type)?.defaultValue ??
  null;
