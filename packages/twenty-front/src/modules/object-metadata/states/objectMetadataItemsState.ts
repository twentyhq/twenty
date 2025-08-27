import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { createState } from 'twenty-ui/utilities';

export const objectMetadataItemsState = createState<ObjectMetadataItem[]>({
  key: 'objectMetadataItemsState',
  defaultValue: [],
});
