import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

type GetActivityTargetFieldNameForObjectArgs = {
  activityObjectNameSingular:
    | CoreObjectNameSingular.Note
    | CoreObjectNameSingular.Task;
  targetObjectMetadataId: string;
  objectMetadataItems: ObjectMetadataItem[];
  isMorphRelation?: boolean;
};

export const getActivityTargetFieldNameForObject = ({
  activityObjectNameSingular,
  targetObjectMetadataId,
  objectMetadataItems,
  isMorphRelation = false,
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

  const targetObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) => objectMetadataItem.id === targetObjectMetadataId,
  );

  if (isMorphRelation && isDefined(targetObjectMetadataItem)) {
    const fieldIdName = getActivityTargetObjectFieldIdName({
      nameSingular: targetObjectMetadataItem.nameSingular,
      isMorphRelation: true,
    });

    return fieldIdName.replace(/Id$/, '');
  }

  return activityTargetObjectMetadata.fields.find(
    (field) =>
      field.relation?.targetObjectMetadata.id === targetObjectMetadataId,
  )?.name;
};
