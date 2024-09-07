import { useActivityTargetObjectRecords } from '@/activities/hooks/useActivityTargetObjectRecords';
import { NoteTarget } from '@/activities/types/NoteTarget';
import { TaskTarget } from '@/activities/types/TaskTarget';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useFieldFocus } from '@/object-record/record-field/hooks/useFieldFocus';
import { useRelationFromManyFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useRelationFromManyFieldDisplay';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';

export const RelationFromManyFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useRelationFromManyFieldDisplay();
  const { isFocused } = useFieldFocus();

  const relationObjectNameSingular =
    fieldDefinition?.metadata.relationObjectMetadataNameSingular;

  if (!fieldValue || !relationObjectNameSingular) {
    return null;
  }

  const { fieldName, objectMetadataNameSingular } = fieldDefinition.metadata;

  const renderExpandableList = (records: ObjectRecord[], objectNameSingular: string, recordProp = '') => (
    <ExpandableList isChipCountDisplayed={isFocused}>
      {records.map((record) => (
        <RecordChip
          key={record.id}
          objectNameSingular={objectNameSingular}
          record={recordProp ? record[recordProp] : record}
        />
      ))}
    </ExpandableList>
  );

  if ((fieldName === 'noteTargets' && objectMetadataNameSingular !== CoreObjectNameSingular.Note) ||
      (fieldName === 'taskTargets' && objectMetadataNameSingular !== CoreObjectNameSingular.Task)) {
    const objectNameSingular = fieldName === 'noteTargets' ? CoreObjectNameSingular.Note : CoreObjectNameSingular.Task;
    const recordProp = fieldName === 'noteTargets' ? 'note' : 'task';
    return renderExpandableList(fieldValue, objectNameSingular, recordProp);
  }

  if ((fieldName === 'taskTargets' && objectMetadataNameSingular === CoreObjectNameSingular.Task) ||
      (fieldName === 'noteTargets' && objectMetadataNameSingular === CoreObjectNameSingular.Note)) {
    const { activityTargetObjectRecords } = useActivityTargetObjectRecords(undefined, fieldValue as NoteTarget[] | TaskTarget[]);
    return     <ExpandableList isChipCountDisplayed={isFocused}>
    {activityTargetObjectRecords.map((record) => (
      <RecordChip
        key={record.targetObject.id}
        objectNameSingular={record.targetObjectMetadataItem.nameSingular}
        record={record.targetObject}
      />
    ))}
  </ExpandableList>

  }

  return renderExpandableList(fieldValue, relationObjectNameSingular);
};
