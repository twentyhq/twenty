import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

export type SettingsRoleRelatedRecordsRule = {
  key: string;
  childObjectMetadataItem: EnrichedObjectMetadataItem;
  fieldMetadataId: string;
  junctionFieldMetadataId: string | null;
  relationLabel: string;
  relationKind: 'BELONGS_TO_ONE' | 'MANY_TO_MANY';
  recordInheritanceRuleId?: string;
};
