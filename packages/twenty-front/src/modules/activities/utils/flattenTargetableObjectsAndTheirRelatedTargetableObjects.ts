import { isNonNullable } from '~/utils/isNonNullable';

import { ActivityTargetableObject } from '../types/ActivityTargetableEntity';

export const flattenTargetableObjectsAndTheirRelatedTargetableObjects = (
  targetableObjectsWithRelatedTargetableObjects: ActivityTargetableObject[],
): ActivityTargetableObject[] => {
  const flattenedTargetableObjects: ActivityTargetableObject[] = [];

  for (const targetableObject of targetableObjectsWithRelatedTargetableObjects ??
    []) {
    flattenedTargetableObjects.push(targetableObject);

    if (isNonNullable(targetableObject.relatedTargetableObjects)) {
      for (const relatedEntity of targetableObject.relatedTargetableObjects ??
        []) {
        flattenedTargetableObjects.push(relatedEntity);
      }
    }
  }

  return flattenedTargetableObjects;
};
