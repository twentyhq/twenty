import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { View } from '@/views/types/View';

export type ObjectPathInfo = {
  objectMetadataItem: ObjectMetadataItem;
  view: View | undefined;
};
