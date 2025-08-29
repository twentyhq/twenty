import { selectorFamily } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const objectMetadataItemsBySingularNameSelector = selectorFamily<
  ObjectMetadataItem[],
  string[]
>({
  key: 'objectMetadataItemsSelector',
  get:
    (objectNameSingulars: string[]) =>
    ({ get }) => {
      const objectMetadataItems = get(objectMetadataItemsState);

      return objectNameSingulars
        .map(
          (objectNameSingular) =>
            objectMetadataItems.find(
              (objectMetadataItem) =>
                objectMetadataItem.nameSingular === objectNameSingular,
            ) ?? null,
        )
        .filter(isDefined);
    },
});
