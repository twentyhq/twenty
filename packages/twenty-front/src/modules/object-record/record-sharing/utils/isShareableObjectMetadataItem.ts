import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

// Mirrors the server: system data is never shared by record
export const isShareableObjectMetadataItem = (
  objectMetadataItem: Pick<EnrichedObjectMetadataItem, 'isSystem'>,
): boolean => !objectMetadataItem.isSystem;
