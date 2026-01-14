import { type ActivityTargetWithTargetRecord } from '@/activities/types/ActivityTargetObject';
import { type Note } from '@/activities/types/Note';
import { type NoteTarget } from '@/activities/types/NoteTarget';
import { type Task } from '@/activities/types/Task';
import { type TaskTarget } from '@/activities/types/TaskTarget';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type GetActivityTargetObjectRecordsProps = {
  activityRecord: Note | Task;
  objectMetadataItems: ObjectMetadataItem[];
  activityTargets?: Nullable<NoteTarget[] | TaskTarget[]>;
};

export const getActivityTargetObjectRecords = ({
  activityRecord,
  objectMetadataItems,
  activityTargets,
}: GetActivityTargetObjectRecordsProps) => {
  if (!isDefined(activityRecord) && !isDefined(activityTargets)) {
    return [];
  }

  const isNote = isDefined(activityRecord) && 'noteTargets' in activityRecord;

  const targets = activityTargets
    ? activityTargets
    : activityRecord &&
        'noteTargets' in activityRecord &&
        activityRecord.noteTargets
      ? activityRecord.noteTargets
      : activityRecord &&
          'taskTargets' in activityRecord &&
          activityRecord.taskTargets
        ? activityRecord.taskTargets
        : [];

  const activityTargetObjectNameSingular = isNote
    ? CoreObjectNameSingular.NoteTarget
    : CoreObjectNameSingular.TaskTarget;

  const activityTargetObjectMetadata = objectMetadataItems.find(
    (item) => item.nameSingular === activityTargetObjectNameSingular,
  );

  const activityTargetRelationFields =
    activityTargetObjectMetadata?.fields.filter(
      (field) =>
        isDefined(field.relation?.targetObjectMetadata.id) &&
        ![CoreObjectNameSingular.Note, CoreObjectNameSingular.Task].includes(
          field.relation?.targetObjectMetadata
            .nameSingular as CoreObjectNameSingular,
        ),
    ) ?? [];

  const activityTargetObjectRecords = targets
    .map<ActivityTargetWithTargetRecord | undefined>((activityTarget) => {
      if (!isDefined(activityTarget)) {
        throw new Error('Cannot find activity target');
      }
      const matchingField = activityTargetRelationFields.find((field) =>
        isDefined(activityTarget[field.name]),
      );

      if (!matchingField || !matchingField.relation) {
        return undefined;
      }

      const correspondingObjectMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.id ===
          matchingField.relation?.targetObjectMetadata.id,
      );

      if (!correspondingObjectMetadataItem) {
        return undefined;
      }

      const targetObjectRecord = activityTarget[matchingField.name] as
        | ObjectRecord
        | undefined;

      if (!isDefined(targetObjectRecord)) {
        throw new Error(
          `Cannot find target object record of type ${correspondingObjectMetadataItem.nameSingular}, make sure the request for activities eagerly loads for the target objects on activity target relation.`,
        );
      }

      return {
        activityTarget,
        targetObject: targetObjectRecord,
        targetObjectMetadataItem: correspondingObjectMetadataItem,
      };
    })
    .filter(isDefined);

  return activityTargetObjectRecords;
};
