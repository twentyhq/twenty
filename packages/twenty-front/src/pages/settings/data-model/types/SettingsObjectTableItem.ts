import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export type SettingsObjectTableItem = {
  objectMetadataItem: ObjectMetadataItem;
  totalObjectCount: number;
  fieldsCount: number;
  objectTypeLabel: string;
  labelPlural: string;
};
