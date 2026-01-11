import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

const getTargetObjectNameSingular = (
  activityObjectNameSingular:
    | CoreObjectNameSingular.Note
    | CoreObjectNameSingular.Task
    | CoreObjectNameSingular.Comment,
): CoreObjectNameSingular => {
  switch (activityObjectNameSingular) {
    case CoreObjectNameSingular.Task:
      return CoreObjectNameSingular.TaskTarget;
    case CoreObjectNameSingular.Note:
      return CoreObjectNameSingular.NoteTarget;
    case CoreObjectNameSingular.Comment:
      return CoreObjectNameSingular.CommentTarget;
  }
};

export const getActivityTargetsFilter = ({
  targetableObjects,
  activityObjectNameSingular,
  objectMetadataItems,
}: {
  targetableObjects: ActivityTargetableObject[];
  activityObjectNameSingular:
    | CoreObjectNameSingular.Note
    | CoreObjectNameSingular.Task
    | CoreObjectNameSingular.Comment;
  objectMetadataItems: ObjectMetadataItem[];
}) => {
  const activityTargetObjectNameSingular = getTargetObjectNameSingular(
    activityObjectNameSingular,
  );

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

        const targetField = activityTargetObjectMetadata?.fields.find(
          (field) =>
            field.relation?.targetObjectMetadata.id ===
            targetObjectMetadataItem.id,
        );

        const joinColumnName = targetField?.settings?.joinColumnName;

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
