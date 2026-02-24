import { objectMetadataItemsBySingularNameSelector } from '@/object-metadata/states/objectMetadataItemsBySingularNameSelector';
import { useFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValue';
import { isDefined } from 'twenty-shared/utils';

export const useDoObjectMetadataItemsExist = (
  objectNameSingulars: string[],
) => {
  const objectMetadataItems = useFamilySelectorValue(
    objectMetadataItemsBySingularNameSelector,
    objectNameSingulars,
  );

  return objectMetadataItems.every((objectMetadataItem) =>
    isDefined(objectMetadataItem),
  );
};
