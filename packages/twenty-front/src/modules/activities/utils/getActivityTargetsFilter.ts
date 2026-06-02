import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getActivityTargetsFilter = ({
  targetableObjects,
  activityObjectNameSingular,
  objectMetadataItems,
}: {
  targetableObjects: Pick<
    ActivityTargetableObject,
    'id' | 'targetObjectNameSingular'
  >[];
  activityObjectNameSingular:
    | CoreObjectNameSingular.Note
    | CoreObjectNameSingular.Task;
  objectMetadataItems: Pick<EnrichedObjectMetadataItem, 'nameSingular' | 'fields' | 'id'>[];
}) => {
  const activityTargetObjectNameSingular =
    activityObjectNameSingular === CoreObjectNameSingular.Task
      ? CoreObjectNameSingular.TaskTarget
      : CoreObjectNameSingular.NoteTarget;

  const activityTargetObjectMetadata = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === activityTargetObjectNameSingular,
  );

  const findManyActivityTargetsQueryFilter = Object.fromEntries(
    targetableObjects
      .map((targetableObject) => {
        const targetObjectMetadataItem = objectMetadataItems.find(
          (item) =>
            item.nameSingular === targetableObject.targetObjectNameSingular,
        );

        if (!isDefined(targetObjectMetadataItem)) {
          return undefined;
        }

        const joinColumnName = activityTargetObjectMetadata?.fields.find(
          (field) =>
            field.relation?.targetObjectMetadata.id ===
            targetObjectMetadataItem.id,
        )?.settings?.joinColumnName;

        if (!isDefined(joinColumnName)) {
          return undefined;
        }

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
