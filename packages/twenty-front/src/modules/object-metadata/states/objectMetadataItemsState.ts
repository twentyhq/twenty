import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const objectMetadataItemsState = createState<ObjectMetadataItem[]>({
  key: 'objectMetadataItemsState',
  defaultValue: [],
});
