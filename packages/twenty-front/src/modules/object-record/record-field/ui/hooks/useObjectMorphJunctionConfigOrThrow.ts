import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getObjectMorphJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getObjectMorphJunctionConfig';
import { isDefined } from 'twenty-shared/utils';

export const useObjectMorphJunctionConfigOrThrow = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });
  const { objectMetadataItems } = useObjectMetadataItems();

  const junctionConfig = getObjectMorphJunctionConfig({
    objectMetadata: objectMetadataItem,
    objectMetadataItems,
  });

  if (!isDefined(junctionConfig)) {
    throw new Error(
      `Cannot resolve morph junction metadata for ${objectNameSingular}`,
    );
  }

  return junctionConfig;
};
