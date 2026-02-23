import { objectMetadataItemsBySingularNameSelector } from '@/object-metadata/states/objectMetadataItemsBySingularNameSelector';
import { useFamilySelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValueV2';
import { isDefined } from 'twenty-shared/utils';

export const useDoObjectMetadataItemsExist = (
  objectNameSingulars: string[],
) => {
  const objectMetadataItems = useFamilySelectorValueV2(
    objectMetadataItemsBySingularNameSelector,
    objectNameSingulars,
  );

  return objectMetadataItems.every((objectMetadataItem) =>
    isDefined(objectMetadataItem),
  );
};
