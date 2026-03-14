import { objectMetadataItemsSelector } from '@/metadata-store/states/objectMetadataItemsSelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const activeObjectNameSingularsSelector = createAtomSelector<string[]>({
  key: 'activeObjectNameSingularsSelector',
  get: ({ get }) => {
    const flatObjects = get(objectMetadataItemsSelector);

    return flatObjects
      .filter((flatObject) => flatObject.isActive)
      .map((flatObject) => flatObject.nameSingular);
  },
});
