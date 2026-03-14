import { objectMetadataItemsWithFieldsSelector } from '@/object-metadata/states/objectMetadataItemsWithFieldsSelector';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const objectMetadataItemsState = createAtomSelector<
  ObjectMetadataItem[]
>({
  key: 'objectMetadataItemsState',
  get: ({ get }) => get(objectMetadataItemsWithFieldsSelector),
});
