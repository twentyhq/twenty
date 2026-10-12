import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { getPermittedFields } from '@/object-metadata/utils/getPermittedFields';
import { mapPaginatedObjectMetadataItemsToObjectMetadataItems } from '@/object-metadata/utils/mapPaginatedObjectMetadataItemsToObjectMetadataItems';

import { mockedStandardObjectMetadataQueryResult } from '~/testing/mock-data/generated/metadata/objects/mock-objects-metadata';

let cachedItems: EnrichedObjectMetadataItem[] | undefined;

export const getTestEnrichedObjectMetadataItemsMock =
  (): EnrichedObjectMetadataItem[] => {
    if (cachedItems === undefined) {
      cachedItems = mapPaginatedObjectMetadataItemsToObjectMetadataItems({
        pagedObjectMetadataItems: mockedStandardObjectMetadataQueryResult,
      }).map((objectMetadataItem) => ({
        ...objectMetadataItem,
        ...getPermittedFields({
          fields: objectMetadataItem.fields,
          objectPermissions: getObjectPermissionsForObject(
            {},
            objectMetadataItem.id,
          ),
        }),
      }));
    }

    return cachedItems;
  };
