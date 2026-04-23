import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { isDefined } from 'twenty-shared/utils';

export const getActivityTargetsFilter = ({
  targetableObjects,
}: {
  targetableObjects: Pick<
    ActivityTargetableObject,
    'id' | 'targetObjectNameSingular'
  >[];
}) => {
  const findManyActivityTargetsQueryFilter = Object.fromEntries(
    targetableObjects
      .map((targetableObject) => {
        const joinColumnName = getActivityTargetObjectFieldIdName({
          nameSingular: targetableObject.targetObjectNameSingular,
        });

        return [
          joinColumnName,
          {
            eq: targetableObject.id,
          },
        ];
      })
      .filter(isDefined),
  );

  return findManyActivityTargetsQueryFilter;
};
