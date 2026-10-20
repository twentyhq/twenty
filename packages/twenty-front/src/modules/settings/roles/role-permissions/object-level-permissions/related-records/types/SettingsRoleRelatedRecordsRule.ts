import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

export type SettingsRoleRelatedRecordsRule = {
  childObjectMetadataItem: EnrichedObjectMetadataItem;
  parentFieldMetadataItem: FieldMetadataItem;
  relationKind: 'BELONGS_TO_ONE' | 'MANY_TO_MANY';
};
