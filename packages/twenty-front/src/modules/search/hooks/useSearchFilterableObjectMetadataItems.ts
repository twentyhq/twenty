import { useMemo } from 'react';
import { OBJECTS_WITH_CHANNEL_VISIBILITY_CONSTRAINTS } from 'twenty-shared/constants';

import { useReadableObjectMetadataItems } from '@/object-metadata/hooks/useReadableObjectMetadataItems';

type UseSearchFilterableObjectMetadataItemsParams = {
  searchFilter?: string;
  includeHiddenObjects?: boolean;
};

// The objects offered as a search filter: everything readable, minus the ones
// whose visibility depends on a connected channel.
export const useSearchFilterableObjectMetadataItems = ({
  searchFilter = '',
  includeHiddenObjects = false,
}: UseSearchFilterableObjectMetadataItemsParams = {}) => {
  const { readableObjectMetadataItems } = useReadableObjectMetadataItems();

  const lowerCasedSearchFilter = searchFilter.toLowerCase();

  return useMemo(
    () =>
      readableObjectMetadataItems.filter((objectMetadataItem) => {
        if (
          OBJECTS_WITH_CHANNEL_VISIBILITY_CONSTRAINTS.includes(
            objectMetadataItem.nameSingular as (typeof OBJECTS_WITH_CHANNEL_VISIBILITY_CONSTRAINTS)[number],
          )
        ) {
          return false;
        }

        if (!includeHiddenObjects && !objectMetadataItem.isSearchable) {
          return false;
        }

        return objectMetadataItem.labelPlural
          .toLowerCase()
          .includes(lowerCasedSearchFilter);
      }),
    [readableObjectMetadataItems, includeHiddenObjects, lowerCasedSearchFilter],
  );
};
