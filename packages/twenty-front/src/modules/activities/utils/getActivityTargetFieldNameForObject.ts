import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

type GetActivityTargetFieldNameForObjectArgs = {
  activityObjectNameSingular:
    | CoreObjectNameSingular.Note
    | CoreObjectNameSingular.Task;
  targetObjectMetadataId: string;
  objectMetadataItems: ObjectMetadataItem[];
};

export const getActivityTargetFieldNameForObject = ({
  activityObjectNameSingular,
  targetObjectMetadataId,
  objectMetadataItems,
}: GetActivityTargetFieldNameForObjectArgs): string | undefined => {
  const activityTargetObjectNameSingular =
    activityObjectNameSingular === CoreObjectNameSingular.Task
      ? CoreObjectNameSingular.TaskTarget
      : CoreObjectNameSingular.NoteTarget;

  const activityTargetObjectMetadata = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === activityTargetObjectNameSingular,
  );

  if (!isDefined(activityTargetObjectMetadata)) {
    return undefined;
  }

  const targetField = activityTargetObjectMetadata.fields.find(
    (field) =>
      field.relation?.targetObjectMetadata.id === targetObjectMetadataId,
  );

  return targetField?.name;
};
