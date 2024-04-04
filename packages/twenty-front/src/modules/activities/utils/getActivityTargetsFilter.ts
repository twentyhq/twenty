import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';

export const getActivityTargetsFilter = ({
  targetableObjects,
}: {
  targetableObjects: ActivityTargetableObject[];
}) => {
  const findManyActivitiyTargetsQueryFilter = Object.fromEntries(
    targetableObjects.map((targetableObject) => {
      const targetObjectFieldName = getActivityTargetObjectFieldIdName({
        nameSingular: targetableObject.targetObjectNameSingular,
      });

      return [
        targetObjectFieldName,
        {
          eq: targetableObject.id,
        },
      ];
    }),
  );

  return findManyActivitiyTargetsQueryFilter;
};
