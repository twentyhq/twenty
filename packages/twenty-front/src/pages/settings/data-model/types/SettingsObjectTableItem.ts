import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

export type SettingsObjectTableItem = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  totalObjectCount: number;
  fieldsCount: number;
  objectTypeLabel: string;
  labelPlural: string;
};
