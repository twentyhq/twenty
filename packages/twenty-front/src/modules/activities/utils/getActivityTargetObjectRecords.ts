import { type ActivityTargetWithTargetRecord } from '@/activities/types/ActivityTargetObject';
import { type Note } from '@/activities/types/Note';
import { type NoteTarget } from '@/activities/types/NoteTarget';
import { type Task } from '@/activities/types/Task';
import { type TaskTarget } from '@/activities/types/TaskTarget';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType, type Nullable } from 'twenty-shared/types';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';

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
    activityTargetObjectMetadata?.fields.filter((field) => {
      if (
        field.type === FieldMetadataType.MORPH_RELATION &&
        isDefined(field.morphRelations) &&
        field.morphRelations.length > 0
      ) {
        return true;
      }

      const targetObjectNameSingular =
        field.relation?.targetObjectMetadata.nameSingular;

      if (!isDefined(field.relation?.targetObjectMetadata.id)) {
        return false;
      }

      if (!isDefined(targetObjectNameSingular)) {
        return false;
      }

      return (
        targetObjectNameSingular !== CoreObjectNameSingular.Note &&
        targetObjectNameSingular !== CoreObjectNameSingular.Task
      );
    }) ?? [];

  const activityTargetObjectRecords = targets
    .map<ActivityTargetWithTargetRecord | undefined>((activityTarget) => {
      if (!isDefined(activityTarget)) {
        throw new Error('Cannot find activity target');
      }

      if (isDefined(activityTarget.deletedAt)) {
        return undefined;
      }

      let matchingFieldName: string | undefined;
      let correspondingObjectMetadataItem: ObjectMetadataItem | undefined;

      for (const field of activityTargetRelationFields) {
        if (
          field.type === FieldMetadataType.MORPH_RELATION &&
          isDefined(field.morphRelations)
        ) {
          const matchingMorphRelation = field.morphRelations.find(
            (morphRelation) => {
              const morphFieldName = computeMorphRelationFieldName({
                fieldName: field.name,
                relationType: morphRelation.type,
                targetObjectMetadataNameSingular:
                  morphRelation.targetObjectMetadata.nameSingular,
                targetObjectMetadataNamePlural:
                  morphRelation.targetObjectMetadata.namePlural,
              });

              return isDefined(activityTarget[morphFieldName]);
            },
          );

          if (isDefined(matchingMorphRelation)) {
            matchingFieldName = computeMorphRelationFieldName({
              fieldName: field.name,
              relationType: matchingMorphRelation.type,
              targetObjectMetadataNameSingular:
                matchingMorphRelation.targetObjectMetadata.nameSingular,
              targetObjectMetadataNamePlural:
                matchingMorphRelation.targetObjectMetadata.namePlural,
            });
            correspondingObjectMetadataItem = objectMetadataItems.find(
              (objectMetadataItem) =>
                objectMetadataItem.id ===
                matchingMorphRelation.targetObjectMetadata.id,
            );
            break;
          }
        } else if (isDefined(activityTarget[field.name])) {
          matchingFieldName = field.name;
          correspondingObjectMetadataItem = objectMetadataItems.find(
            (objectMetadataItem) =>
              objectMetadataItem.id === field.relation?.targetObjectMetadata.id,
          );
          break;
        }
      }

      if (
        !isDefined(matchingFieldName) ||
        !isDefined(correspondingObjectMetadataItem)
      ) {
        return undefined;
      }

      const targetObjectRecord: ObjectRecord | undefined =
        activityTarget[matchingFieldName];

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
