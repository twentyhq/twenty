import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const objectMetadataItemsState = createStateV2<ObjectMetadataItem[]>({
  key: 'objectMetadataItemsState',
  defaultValue: [],
});
