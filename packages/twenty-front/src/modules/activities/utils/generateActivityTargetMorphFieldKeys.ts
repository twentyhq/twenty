import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const generateActivityTargetMorphFieldKeys = (
  objectMetadataItems: ObjectMetadataItem[],
  isMorphRelation: boolean,
) => {
  const targetableObjectMetadataItems = objectMetadataItems.filter(
    (objectMetadataItem) =>
      objectMetadataItem.isActive && !objectMetadataItem.isSystem,
  );

  const targetableObjects = Object.fromEntries(
    targetableObjectMetadataItems.map((objectMetadataItem) => {
      const targetFieldIdName = getActivityTargetObjectFieldIdName({
        nameSingular: objectMetadataItem.nameSingular,
        isMorphRelation,
      });

      return [targetFieldIdName.replace(/Id$/, ''), true];
    }),
  );

  const targetableObjectIds = Object.fromEntries(
    targetableObjectMetadataItems.map((objectMetadataItem) => {
      const targetFieldIdName = getActivityTargetObjectFieldIdName({
        nameSingular: objectMetadataItem.nameSingular,
        isMorphRelation,
      });

      return [targetFieldIdName, true];
    }),
  );

  return {
    ...targetableObjects,
    ...targetableObjectIds,
  };
};
