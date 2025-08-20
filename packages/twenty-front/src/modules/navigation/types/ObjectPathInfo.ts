import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type View } from '@/views/types/View';

export type ObjectPathInfo = {
  objectMetadataItem: ObjectMetadataItem;
  view: View | undefined;
};
