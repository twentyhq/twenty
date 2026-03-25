import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

export type FlatObjectMetadataItem = Omit<
  EnrichedObjectMetadataItem,
  'fields' | 'readableFields' | 'updatableFields' | 'indexMetadatas'
>;
