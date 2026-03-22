import { type FlatFieldMetadataItem } from '@/metadata-store/types/FlatFieldMetadataItem';
import { type FlatIndexMetadataItem } from '@/metadata-store/types/FlatIndexMetadataItem';
import { type FlatObjectMetadataItem } from '@/metadata-store/types/FlatObjectMetadataItem';
import { mapPaginatedObjectMetadataItemsToObjectMetadataItems } from '@/object-metadata/utils/mapPaginatedObjectMetadataItemsToObjectMetadataItems';
import { type ObjectMetadataItemsQuery } from '~/generated-metadata/graphql';

type SplitResult = {
  flatObjects: FlatObjectMetadataItem[];
  flatFields: FlatFieldMetadataItem[];
  flatIndexes: FlatIndexMetadataItem[];
};

export const splitObjectMetadataGqlResponse = (
  pagedObjectMetadataItems: ObjectMetadataItemsQuery | undefined,
): SplitResult => {
  const compositeObjects = mapPaginatedObjectMetadataItemsToObjectMetadataItems(
    {
      pagedObjectMetadataItems,
    },
  );

  const flatObjects: FlatObjectMetadataItem[] = [];
  const flatFields: FlatFieldMetadataItem[] = [];
  const flatIndexes: FlatIndexMetadataItem[] = [];

  for (const compositeObject of compositeObjects) {
    const {
      fields = [],
      indexMetadatas = [],
      ...objectProperties
    } = compositeObject;

    flatObjects.push(objectProperties);

    for (const field of fields) {
      flatFields.push({
        ...field,
        objectMetadataId: compositeObject.id,
      });
    }

    for (const index of indexMetadatas) {
      flatIndexes.push({
        ...index,
        objectMetadataId: compositeObject.id,
      });
    }
  }

  return { flatObjects, flatFields, flatIndexes };
};
