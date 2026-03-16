import { objectMetadataItemsWithFieldsSelector } from '@/object-metadata/states/objectMetadataItemsWithFieldsSelector';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const objectMetadataItemsSelector = createAtomSelector<
  ObjectMetadataItem[]
>({
  key: 'objectMetadataItemsSelector',
  get: ({ get }) => get(objectMetadataItemsWithFieldsSelector),
});
