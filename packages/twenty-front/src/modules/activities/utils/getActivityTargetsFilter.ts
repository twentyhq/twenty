import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { findTargetFieldInfo } from '@/object-record/record-field/ui/utils/junction/findTargetFieldInfo';
import { isDefined } from 'twenty-shared/utils';

export const getActivityTargetsFilter = ({
  targetableObjects,
  activityTargetObjectMetadata,
  objectMetadataItems,
}: {
  targetableObjects: Pick<
    ActivityTargetableObject,
    'id' | 'targetObjectNameSingular'
  >[];
  activityTargetObjectMetadata: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}) => {
  const findManyActivityTargetsQueryFilter = Object.fromEntries(
    targetableObjects
      .map((targetableObject) => {
        const targetObjectMetadata = objectMetadataItems.find(
          (objectMetadataItem) =>
            objectMetadataItem.nameSingular ===
            targetableObject.targetObjectNameSingular,
        );

        const joinColumnName = findTargetFieldInfo(
          activityTargetObjectMetadata.fields,
          targetObjectMetadata?.id ?? '',
          objectMetadataItems,
        )?.joinColumnName;

        return isDefined(joinColumnName)
          ? [
              joinColumnName,
              {
                eq: targetableObject.id,
              },
            ]
          : undefined;
      })
      .filter(isDefined),
  );

  return findManyActivityTargetsQueryFilter;
};
