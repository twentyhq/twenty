import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { enrichObjectMetadataItemsWithPermissions } from '@/object-metadata/utils/enrichObjectMetadataItemsWithPermissions';
import { mapPaginatedObjectMetadataItemsToObjectMetadataItems } from '@/object-metadata/utils/mapPaginatedObjectMetadataItemsToObjectMetadataItems';
import { type ObjectMetadataItemsQuery } from '~/generated-metadata/graphql';

import { mockedStandardObjectMetadataQueryResult } from '~/testing/mock-data/generated/metadata/objects/mock-objects-metadata';

export const generatedMockObjectMetadataItems: ObjectMetadataItem[] =
  enrichObjectMetadataItemsWithPermissions({
    objectMetadataItems: mapPaginatedObjectMetadataItemsToObjectMetadataItems({
      pagedObjectMetadataItems:
        mockedStandardObjectMetadataQueryResult as unknown as ObjectMetadataItemsQuery,
    }),
    objectPermissionsByObjectMetadataId: {},
  });
