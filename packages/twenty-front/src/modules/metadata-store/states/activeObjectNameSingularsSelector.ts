import { objectMetadataItemsCurrentSelector } from '@/metadata-store/states/objectMetadataItemsCurrentSelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const activeObjectNameSingularsSelector = createAtomSelector<string[]>({
  key: 'activeObjectNameSingularsSelector',
  get: ({ get }) => {
    const flatObjects = get(objectMetadataItemsCurrentSelector);

    return flatObjects
      .filter((flatObject) => flatObject.isActive)
      .map((flatObject) => flatObject.nameSingular);
  },
});
