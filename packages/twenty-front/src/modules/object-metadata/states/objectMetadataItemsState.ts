import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const objectMetadataItemsState = createAtomState<ObjectMetadataItem[]>({
  key: 'objectMetadataItemsState',
  defaultValue: [],
});
