import { createState } from 'twenty-ui';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const objectMetadataItemsState = createState<ObjectMetadataItem[]>({
  key: 'objectMetadataItemsState',
  defaultValue: [],
});
