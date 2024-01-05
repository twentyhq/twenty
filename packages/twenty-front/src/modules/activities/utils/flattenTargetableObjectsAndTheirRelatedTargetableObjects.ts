import { ActivityTargetableObject } from '../types/ActivityTargetableEntity';

export const flattenTargetableObjectsAndTheirRelatedTargetableObjects = (
  targetableObjectsWithRelatedTargetableObjects: ActivityTargetableObject[],
): ActivityTargetableObject[] => {
  const flattenedTargetableObjects: ActivityTargetableObject[] = [];

  for (const targetableObject of targetableObjectsWithRelatedTargetableObjects ??
    []) {
    flattenedTargetableObjects.push(targetableObject);

    if (targetableObject.relatedTargetableObjects) {
      for (const relatedEntity of targetableObject.relatedTargetableObjects ??
        []) {
        flattenedTargetableObjects.push(relatedEntity);
      }
    }
  }

  return flattenedTargetableObjects;
};
