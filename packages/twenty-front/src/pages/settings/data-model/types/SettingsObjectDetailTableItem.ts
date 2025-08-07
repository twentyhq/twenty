import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type FieldIdentifierType } from '@/settings/data-model/types/FieldIdentifierType';

export type SettingsObjectDetailTableItem = {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: ObjectMetadataItem;
  fieldType: string | boolean;
  label: string;
  dataType: string;
  identifierType?: FieldIdentifierType;
};
