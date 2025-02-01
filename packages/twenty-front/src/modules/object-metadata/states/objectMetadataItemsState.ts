import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { createState } from "twenty-shared";

export const objectMetadataItemsState = createState<ObjectMetadataItem[]>({
  key: 'objectMetadataItemsState',
  defaultValue: [],
});
