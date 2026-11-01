import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldIdentifierType } from '@/settings/data-model/types/FieldIdentifierType';

export type SettingsObjectDetailTableItem = {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: EnrichedObjectMetadataItem;
  fieldType: string | boolean;
  label: string;
  dataType: string;
  identifierType?: FieldIdentifierType;
};
