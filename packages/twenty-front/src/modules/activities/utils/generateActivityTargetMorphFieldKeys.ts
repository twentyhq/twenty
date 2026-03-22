import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

export const generateActivityTargetMorphFieldKeys = (
  objectMetadataItems: EnrichedObjectMetadataItem[],
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
