import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

type GetActivityTargetFieldNameForObjectArgs = {
  activityObjectNameSingular:
    | CoreObjectNameSingular.Note
    | CoreObjectNameSingular.Task;
  targetObjectMetadataId: string;
  objectMetadataItems: EnrichedObjectMetadataItem[];
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

  const targetObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) => objectMetadataItem.id === targetObjectMetadataId,
  );

  if (!isDefined(targetObjectMetadataItem)) {
    return undefined;
  }

  const fieldIdName = getActivityTargetObjectFieldIdName({
    nameSingular: targetObjectMetadataItem.nameSingular,
  });

  return fieldIdName.replace(/Id$/, '');
};
