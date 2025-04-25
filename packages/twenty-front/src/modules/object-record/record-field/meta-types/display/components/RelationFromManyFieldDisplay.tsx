import { useActivityTargetObjectRecords } from '@/activities/hooks/useActivityTargetObjectRecords';
import { NoteTarget } from '@/activities/types/NoteTarget';
import { TaskTarget } from '@/activities/types/TaskTarget';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordChip } from '@/object-record/components/RecordChip';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useFieldFocus } from '@/object-record/record-field/hooks/useFieldFocus';
import { useRelationFromManyFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useRelationFromManyFieldDisplay';

import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { pascalCase } from '~/utils/string/pascalCase';

export const RelationFromManyFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useRelationFromManyFieldDisplay();
  const { isFocused } = useFieldFocus();
  const { isReadOnly } = useContext(FieldContext);

  const { fieldName, objectMetadataNameSingular } = fieldDefinition.metadata;

  const objectNameSingular =
    fieldDefinition?.metadata.relationObjectMetadataNameSingular;

  const { activityTargetObjectRecords } = useActivityTargetObjectRecords(
    '',
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
    const formattedRecords = fieldValue.map((record) => {
      if (!isDefined(record)) {
        return undefined;
      }

      if (!isDefined(record[relationFieldName])) {
        return {
          ...record,
          [relationFieldName]: {
            id: 'fallback-id',
            title: pascalCase(relationFieldName),
          },
        };
      }

      return record;
    });
    return (
      <ExpandableList isChipCountDisplayed={isFocused}>
        {formattedRecords
          .map((record) => {
            if (!isDefined(record)) {
              return undefined;
            }

            return (
              <RecordChip
                key={record.id}
                objectNameSingular={objectNameSingular}
                record={record[relationFieldName]}
                forceDisableClick={isReadOnly}
              />
            );
          })
          .filter(isDefined)}
      </ExpandableList>
    );
  } else if (isRelationFromActivityTargets) {
    return (
      <ExpandableList isChipCountDisplayed={isFocused}>
        {activityTargetObjectRecords.filter(isDefined).map((record) => (
          <RecordChip
            key={record.targetObject.id}
            objectNameSingular={record.targetObjectMetadataItem.nameSingular}
            record={record.targetObject}
            forceDisableClick={isReadOnly}
          />
        ))}
      </ExpandableList>
    );
  } else {
    return (
      <ExpandableList isChipCountDisplayed={isFocused}>
        {fieldValue.filter(isDefined).map((record) => (
          <RecordChip
            key={record.id}
            objectNameSingular={objectNameSingular}
            record={record}
            forceDisableClick={isReadOnly}
          />
        ))}
      </ExpandableList>
    );
  }
};
