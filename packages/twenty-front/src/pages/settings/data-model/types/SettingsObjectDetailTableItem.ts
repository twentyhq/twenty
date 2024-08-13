import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export type SettingsObjectDetailTableItem = {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: ObjectMetadataItem;
  fieldType: string | boolean;
  label: string;
  dataType: string;
  identifier?: string;
};
