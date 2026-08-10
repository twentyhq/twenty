import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useReadableObjectMetadataItems } from '@/object-metadata/hooks/useReadableObjectMetadataItems';

type UseSearchableObjectNameSingularsParams = {
  selectedObjectNameSingular?: string | null;
  // Passed in rather than read from the side panel state, so a surface that
  // only ever searches searchable objects cannot inherit another one's scope.
  includeHiddenObjects?: boolean;
};

export const useSearchableObjectNameSingulars = ({
  selectedObjectNameSingular = null,
  includeHiddenObjects = false,
}: UseSearchableObjectNameSingularsParams = {}) => {
  const { readableObjectMetadataItems } = useReadableObjectMetadataItems();

  return useMemo(() => {
    if (isDefined(selectedObjectNameSingular)) {
      return [selectedObjectNameSingular];
    }

    return readableObjectMetadataItems
      .filter((item) => includeHiddenObjects || item.isSearchable)
      .map((item) => item.nameSingular);
  }, [
    readableObjectMetadataItems,
    selectedObjectNameSingular,
    includeHiddenObjects,
  ]);
};
