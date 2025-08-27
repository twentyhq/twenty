import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const generateActivityTargetMorphFieldKeys = (
  objectMetadataItems: ObjectMetadataItem[],
) => {
  const targetableObjects = Object.fromEntries(
    objectMetadataItems
      .filter(
        (objectMetadataItem) =>
          objectMetadataItem.isActive && !objectMetadataItem.isSystem,
      )
      .map((objectMetadataItem) => [objectMetadataItem.nameSingular, true]),
  );

  const targetableObjectIds = Object.fromEntries(
    objectMetadataItems
      .filter(
        (objectMetadataItem) =>
          objectMetadataItem.isActive && !objectMetadataItem.isSystem,
      )
      .map((objectMetadataItem) => [
        `${objectMetadataItem.nameSingular}Id`,
        true,
      ]),
  );

  return {
    ...targetableObjects,
    ...targetableObjectIds,
  };
};
