import { type ObjectMetadataItemWithRelated } from '@/metadata-store/utils/splitObjectMetadataItemWithRelated';
import { mapPaginatedObjectMetadataItemsToObjectMetadataItems } from '@/object-metadata/utils/mapPaginatedObjectMetadataItemsToObjectMetadataItems';
import { type ObjectMetadataItemsQuery } from '~/generated-metadata/graphql';

import { mockedStandardObjectMetadataQueryResult } from '~/testing/mock-data/generated/metadata/objects/mock-objects-metadata';

export const generatedMockObjectMetadataItemsWithRelated: ObjectMetadataItemWithRelated[] =
  mapPaginatedObjectMetadataItemsToObjectMetadataItems({
    pagedObjectMetadataItems:
      mockedStandardObjectMetadataQueryResult as unknown as ObjectMetadataItemsQuery,
  });
