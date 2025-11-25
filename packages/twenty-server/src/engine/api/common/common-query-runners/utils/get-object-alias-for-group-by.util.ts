import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

export const getObjectAlias = (
  objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
): string => {
  return objectMetadataItemWithFieldMaps.nameSingular;
};
