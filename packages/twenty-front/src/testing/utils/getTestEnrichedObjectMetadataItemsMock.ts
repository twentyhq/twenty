import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { enrichObjectMetadataItemsWithPermissions } from '@/object-metadata/utils/enrichObjectMetadataItemsWithPermissions';
import { mapPaginatedObjectMetadataItemsToObjectMetadataItems } from '@/object-metadata/utils/mapPaginatedObjectMetadataItemsToObjectMetadataItems';

import { mockedStandardObjectMetadataQueryResult } from '~/testing/mock-data/generated/metadata/objects/mock-objects-metadata';

let cachedItems: EnrichedObjectMetadataItem[] | undefined;

export const getTestEnrichedObjectMetadataItemsMock =
  (): EnrichedObjectMetadataItem[] => {
    if (cachedItems === undefined) {
      cachedItems = enrichObjectMetadataItemsWithPermissions({
        objectMetadataItems:
          mapPaginatedObjectMetadataItemsToObjectMetadataItems({
            pagedObjectMetadataItems: mockedStandardObjectMetadataQueryResult,
          }),
        objectPermissionsByObjectMetadataId: {},
      });
    }

    return cachedItems;
  };
