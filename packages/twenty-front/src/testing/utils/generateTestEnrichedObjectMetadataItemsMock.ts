import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { enrichObjectMetadataItemsWithPermissions } from '@/object-metadata/utils/enrichObjectMetadataItemsWithPermissions';
import { mapPaginatedObjectMetadataItemsToObjectMetadataItems } from '@/object-metadata/utils/mapPaginatedObjectMetadataItemsToObjectMetadataItems';

import { mockedStandardObjectMetadataQueryResult } from '~/testing/mock-data/generated/metadata/objects/mock-objects-metadata';

export const generateTestEnrichedObjectMetadataItemsMock: EnrichedObjectMetadataItem[] =
  enrichObjectMetadataItemsWithPermissions({
    objectMetadataItems: mapPaginatedObjectMetadataItemsToObjectMetadataItems({
      pagedObjectMetadataItems: mockedStandardObjectMetadataQueryResult,
    }),
    objectPermissionsByObjectMetadataId: {},
  });
