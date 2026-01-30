import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const getActivityTargetsFilter = ({
  targetableObjects,
  activityObjectNameSingular,
  objectMetadataItems,
  isMorphRelation = false,
}: {
  targetableObjects: ActivityTargetableObject[];
  activityObjectNameSingular:
    | CoreObjectNameSingular.Note
    | CoreObjectNameSingular.Task;
  objectMetadataItems: ObjectMetadataItem[];
  isMorphRelation?: boolean;
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

        const joinColumnName = isMorphRelation
          ? getActivityTargetObjectFieldIdName({
              nameSingular: targetObjectMetadataItem.nameSingular,
              isMorphRelation: true,
            })
          : activityTargetObjectMetadata?.fields.find(
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
