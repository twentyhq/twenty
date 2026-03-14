import { type FlatFieldMetadataItem } from '@/metadata-store/types/FlatFieldMetadataItem';
import { type FlatIndexMetadataItem } from '@/metadata-store/types/FlatIndexMetadataItem';
import { type FlatObjectMetadataItem } from '@/metadata-store/types/FlatObjectMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

type CompositeObjectMetadataItem = Omit<
  ObjectMetadataItem,
  'readableFields' | 'updatableFields'
>;

type SplitResult = {
  flatObjects: FlatObjectMetadataItem[];
  flatFields: FlatFieldMetadataItem[];
  flatIndexes: FlatIndexMetadataItem[];
};

export const splitCompositeObjectMetadata = (
  compositeObjects: CompositeObjectMetadataItem[],
): SplitResult => {
  const flatObjects: FlatObjectMetadataItem[] = [];
  const flatFields: FlatFieldMetadataItem[] = [];
  const flatIndexes: FlatIndexMetadataItem[] = [];

  for (const compositeObject of compositeObjects) {
    const { fields, indexMetadatas, ...objectProperties } = compositeObject;

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
