import { objectColorsDraftState } from '@/layout-customization/states/objectColorsDraftState';
import { objectMetadataItemsWithFieldsSelector } from '@/object-metadata/states/objectMetadataItemsWithFieldsSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const objectMetadataItemsSelector = createAtomSelector<
  EnrichedObjectMetadataItem[]
>({
  key: 'objectMetadataItemsSelector',
  get: ({ get }) => {
    const objectMetadataItems = get(objectMetadataItemsWithFieldsSelector);
    const objectColorsDraft = get(objectColorsDraftState);
    if (Object.keys(objectColorsDraft).length === 0) {
      return objectMetadataItems;
    }
    return objectMetadataItems.map((object) =>
      objectColorsDraft[object.id]
        ? { ...object, color: objectColorsDraft[object.id] }
        : object,
    );
  },
});
