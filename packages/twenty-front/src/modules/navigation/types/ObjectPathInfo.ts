import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

export type ObjectPathInfo = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  viewId: string | undefined;
};
