import { useRecoilValue } from 'recoil';

import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';

import { isDefined } from 'twenty-shared/utils';

export const useObjectMetadataItemsAreDefined = (
  objectNameSingulars: string[],
) => {
  // Single hook call that gets all items at once
  const objectMetadataItems = useRecoilValue(
    objectMetadataItemsSelector(objectNameSingulars),
  );

  return objectMetadataItems.every((objectMetadataItem) =>
    isDefined(objectMetadataItem),
  );
};
