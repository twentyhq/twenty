import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import {
  getObjectMorphJunctionConfig,
  type ObjectMorphJunctionConfig,
} from '@/object-record/record-field/ui/utils/junction/getObjectMorphJunctionConfig';
import { isDefined } from 'twenty-shared/utils';

export const useObjectMorphJunctionConfig = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}): ObjectMorphJunctionConfig | null => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const objectMetadata = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === objectNameSingular,
  );

  if (!isDefined(objectMetadata)) {
    return null;
  }

  return getObjectMorphJunctionConfig({
    objectMetadata,
    objectMetadataItems,
  });
};
