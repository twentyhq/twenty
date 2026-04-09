import { flatObjectMetadataItemsSelector } from '@/object-metadata/states/flatObjectMetadataItemsSelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const activeObjectNameSingularsSelector = createAtomSelector<string[]>({
  key: 'activeObjectNameSingularsSelector',
  get: ({ get }) => {
    const flatObjects = get(flatObjectMetadataItemsSelector);

    return flatObjects
      .filter((flatObject) => flatObject.isActive)
      .map((flatObject) => flatObject.nameSingular);
  },
});
