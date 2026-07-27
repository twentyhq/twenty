import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetJoinColumnName } from '@/activities/utils/getActivityTargetJoinColumnName';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const getActivityTargetsFilter = ({
  targetableObjects,
  activityTargetObjectMetadataItem,
}: {
  targetableObjects: Pick<
    ActivityTargetableObject,
    'id' | 'targetObjectNameSingular'
  >[];
  activityTargetObjectMetadataItem: EnrichedObjectMetadataItem;
}) => {
  const findManyActivityTargetsQueryFilter = Object.fromEntries(
    targetableObjects
      .map((targetableObject) => {
        const joinColumnName = getActivityTargetJoinColumnName({
          activityTargetObjectMetadataItem,
          targetObjectNameSingular: targetableObject.targetObjectNameSingular,
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
