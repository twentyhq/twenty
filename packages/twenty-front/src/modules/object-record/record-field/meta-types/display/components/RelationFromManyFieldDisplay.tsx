import { useActivityTargetObjectRecords } from '@/activities/hooks/useActivityTargetObjectRecords';
import { NoteTarget } from '@/activities/types/NoteTarget';
import { TaskTarget } from '@/activities/types/TaskTarget';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useFieldFocus } from '@/object-record/record-field/hooks/useFieldFocus';
import { useRelationFromManyFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useRelationFromManyFieldDisplay';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { isNull } from '@sniptt/guards';

export const RelationFromManyFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useRelationFromManyFieldDisplay();
  const { isFocused } = useFieldFocus();

  const { fieldName, objectMetadataNameSingular } = fieldDefinition.metadata;

  const objectNameSingular =
    fieldDefinition?.metadata.relationObjectMetadataNameSingular;

  const { activityTargetObjectRecords } = useActivityTargetObjectRecords(
    undefined,
    fieldValue as NoteTarget[] | TaskTarget[],
  );

  if (!fieldValue || !objectNameSingular) {
    return null;
  }

  const isRelationFromActivityTargets =
    (fieldName === 'noteTargets' &&
      objectMetadataNameSingular === CoreObjectNameSingular.Note) ||
    (fieldName === 'taskTargets' &&
      objectMetadataNameSingular === CoreObjectNameSingular.Task);

  const isRelationFromManyActivities =
    (fieldName === 'noteTargets' &&
      objectMetadataNameSingular !== CoreObjectNameSingular.Note) ||
    (fieldName === 'taskTargets' &&
      objectMetadataNameSingular !== CoreObjectNameSingular.Task);

  if (isRelationFromManyActivities) {
    const objectNameSingular =
      fieldName === 'noteTargets'
        ? CoreObjectNameSingular.Note
        : CoreObjectNameSingular.Task;

    const relationFieldName = fieldName === 'noteTargets' ? 'note' : 'task';

    return (
      <ExpandableList isChipCountDisplayed={isFocused}>
        {fieldValue
          .filter((record) => !isNull(record[relationFieldName]))
          .map((record) => (
            <RecordChip
              key={record.id}
              objectNameSingular={objectNameSingular}
              record={record[relationFieldName]}
            />
          ))}
      </ExpandableList>
    );
  } else if (isRelationFromActivityTargets) {
    return (
      <ExpandableList isChipCountDisplayed={isFocused}>
        {activityTargetObjectRecords
          .filter((record) => !isNull(record.targetObject))
          .map((record) => (
            <RecordChip
              key={record.targetObject.id}
              objectNameSingular={record.targetObjectMetadataItem.nameSingular}
              record={record.targetObject}
            />
          ))}
      </ExpandableList>
    );
  } else {
    return (
      <ExpandableList isChipCountDisplayed={isFocused}>
        {fieldValue
          .filter((record) => !isNull(record))
          .map((record) => (
            <RecordChip
              key={record.id}
              objectNameSingular={objectNameSingular}
              record={record}
            />
          ))}
      </ExpandableList>
    );
  }
};
