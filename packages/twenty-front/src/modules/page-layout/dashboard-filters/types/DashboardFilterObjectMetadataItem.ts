import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

export type DashboardFilterObjectMetadataItem = Pick<
  EnrichedObjectMetadataItem,
  'id' | 'nameSingular' | 'labelSingular' | 'icon' | 'fields'
>;
