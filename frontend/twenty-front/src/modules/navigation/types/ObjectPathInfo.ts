import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type View } from '@/views/types/View';

export type ObjectPathInfo = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  view: View | undefined;
};
