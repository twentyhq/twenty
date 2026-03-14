import { type FlatFieldMetadataItem } from '@/metadata-store/types/FlatFieldMetadataItem';
import { type FlatIndexMetadataItem } from '@/metadata-store/types/FlatIndexMetadataItem';
import { type FlatObjectMetadataItem } from '@/metadata-store/types/FlatObjectMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export type ObjectMetadataItemWithRelated = Omit<
  ObjectMetadataItem,
  'readableFields' | 'updatableFields'
>;

type SplitResult = {
  flatObjects: FlatObjectMetadataItem[];
  flatFields: FlatFieldMetadataItem[];
  flatIndexes: FlatIndexMetadataItem[];
};

export const splitObjectMetadataItemWithRelated = (
  objectMetadataItemsWithRelated: ObjectMetadataItemWithRelated[],
): SplitResult => {
  const flatObjects: FlatObjectMetadataItem[] = [];
  const flatFields: FlatFieldMetadataItem[] = [];
  const flatIndexes: FlatIndexMetadataItem[] = [];

  for (const objectMetadataItemWithRelated of objectMetadataItemsWithRelated) {
    const { fields, indexMetadatas, ...objectProperties } =
      objectMetadataItemWithRelated;

    flatObjects.push(objectProperties);

    for (const field of fields) {
      flatFields.push({
        ...field,
        objectMetadataId: objectMetadataItemWithRelated.id,
      });
    }

    for (const index of indexMetadatas) {
      flatIndexes.push({
        ...index,
        objectMetadataId: objectMetadataItemWithRelated.id,
      });
    }
  }

  return { flatObjects, flatFields, flatIndexes };
};
