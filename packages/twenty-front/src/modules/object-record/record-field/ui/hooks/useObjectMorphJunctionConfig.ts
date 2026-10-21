import { useMemo } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getObjectMorphJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getObjectMorphJunctionConfig';

export const useObjectMorphJunctionConfig = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });
  const { objectMetadataItems } = useObjectMetadataItems();

  return useMemo(
    () =>
      getObjectMorphJunctionConfig({
        objectMetadata: objectMetadataItem,
        objectMetadataItems,
      }),
    [objectMetadataItem, objectMetadataItems],
  );
};
