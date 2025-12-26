import { useContext, useMemo } from 'react';

import { useActivityTargetObjectRecords } from '@/activities/hooks/useActivityTargetObjectRecords';
import { type NoteTarget } from '@/activities/types/NoteTarget';
import { type TaskTarget } from '@/activities/types/TaskTarget';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { RecordChip } from '@/object-record/components/RecordChip';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useFieldFocus } from '@/object-record/record-field/ui/hooks/useFieldFocus';
import { useRelationFromManyFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useRelationFromManyFieldDisplay';
import { type FieldRelationMetadataSettings } from '@/object-record/record-field/ui/types/FieldMetadata';
import { hasJunctionTargetRelationFieldIds } from '@/object-record/record-field/ui/utils/isJunctionRelation';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import styled from '@emotion/styled';
import { isArray } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: flex-start;
  max-width: 100%;
  overflow: hidden;
  width: 100%;
`;

export const RelationFromManyFieldDisplay = () => {
  const { fieldValue, fieldDefinition, generateRecordChipData } =
    useRelationFromManyFieldDisplay();
  const { isFocused } = useFieldFocus();
  const { disableChipClick, triggerEvent } = useContext(FieldContext);
  const { objectMetadataItems } = useObjectMetadataItems();

  const { fieldName, objectMetadataNameSingular } = fieldDefinition.metadata;

  const relationObjectNameSingular =
    fieldDefinition?.metadata.relationObjectMetadataNameSingular;

  // Get the actual field metadata item with saved settings
  const { fieldMetadataItem } = getFieldMetadataItemById({
    fieldMetadataId: fieldDefinition.fieldMetadataId,
    objectMetadataItems,
  });
  const settings = fieldMetadataItem?.settings as FieldRelationMetadataSettings;
  const isJunctionRelation = hasJunctionTargetRelationFieldIds(settings);

  // Get junction config for display
  const junctionConfig = useMemo(() => {
    if (!isJunctionRelation || !settings) {
      return null;
    }
    const junctionObjectMetadata = objectMetadataItems.find(
      (item) => item.id === fieldDefinition.metadata.relationObjectMetadataId,
    );
    if (!junctionObjectMetadata) return null;

    const targetFieldId = settings.junctionTargetRelationFieldIds?.[0];
    const targetField = junctionObjectMetadata.fields.find(
      (field) => field.id === targetFieldId,
    );
    if (!targetField) return null;

    // Check if target field is a MORPH_RELATION (polymorphic)
    const isMorphRelation =
      targetField.type === FieldMetadataType.MORPH_RELATION;

    // For regular relations, get the single target object
    let targetObjectMetadata;
    if (!isMorphRelation && isDefined(targetField.relation)) {
      targetObjectMetadata = objectMetadataItems.find(
        (item) => item.id === targetField.relation?.targetObjectMetadata.id,
      );
    }

    return {
      targetField,
      targetObjectMetadata,
      isMorphRelation,
    };
  }, [
    isJunctionRelation,
    objectMetadataItems,
    fieldDefinition.metadata.relationObjectMetadataId,
    settings,
  ]);

  const { activityTargetObjectRecords } = useActivityTargetObjectRecords(
    '',
    fieldValue as NoteTarget[] | TaskTarget[],
  );

  if (!isDefined(fieldValue)) {
    return null;
  }

  if (!isArray(fieldValue)) {
    return null;
  }

  if (!isDefined(!relationObjectNameSingular)) {
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

    return isFocused ? (
      <ExpandableList isChipCountDisplayed={isFocused}>
        {fieldValue
          ?.map((record) => {
            if (!isDefined(record) || !isDefined(record[relationFieldName])) {
              return undefined;
            }
            return (
              <RecordChip
                key={record.id}
                objectNameSingular={objectNameSingular}
                record={record[relationFieldName]}
                forceDisableClick={disableChipClick}
              />
            );
          })
          .filter(isDefined)}
      </ExpandableList>
    ) : (
      <StyledContainer>
        {fieldValue
          ?.map((record) => {
            if (!isDefined(record) || !isDefined(record[relationFieldName])) {
              return undefined;
            }
            return (
              <RecordChip
                key={record.id}
                objectNameSingular={objectNameSingular}
                record={record[relationFieldName]}
                forceDisableClick={disableChipClick}
              />
            );
          })
          .filter(isDefined)}
      </StyledContainer>
    );
  } else if (isJunctionRelation && isDefined(junctionConfig)) {
    // Junction relation: display target objects extracted from junction records
    const { targetField, targetObjectMetadata, isMorphRelation } =
      junctionConfig;

    if (!targetField) {
      return null;
    }

    // For regular relations, we need the target object metadata
    if (!isMorphRelation && !targetObjectMetadata) {
      return null;
    }

    // Extract target records from junction records
    const targetRecordsWithMetadata: Array<{
      record: ObjectRecord;
      objectMetadata: ObjectMetadataItem;
    }> = [];

    for (const junctionRecord of fieldValue) {
      if (!isDefined(junctionRecord)) continue;

      if (isMorphRelation) {
        // For MORPH: scan all object metadata to find which field is populated
        for (const objectMetadataItem of objectMetadataItems) {
          if (!objectMetadataItem.isActive || objectMetadataItem.isSystem) {
            continue;
          }
          const targetObject = junctionRecord[objectMetadataItem.nameSingular];
          if (
            isDefined(targetObject) &&
            typeof targetObject === 'object' &&
            'id' in targetObject
          ) {
            targetRecordsWithMetadata.push({
              record: targetObject as ObjectRecord,
              objectMetadata: objectMetadataItem,
            });
            break;
          }
        }
      } else {
        // For regular RELATION: use the known target field name
        const targetObject = junctionRecord[targetField.name];
        if (
          isDefined(targetObject) &&
          typeof targetObject === 'object' &&
          isDefined(targetObjectMetadata)
        ) {
          targetRecordsWithMetadata.push({
            record: targetObject as ObjectRecord,
            objectMetadata: targetObjectMetadata,
          });
        }
      }
    }

    return (
      <ExpandableList isChipCountDisplayed={isFocused}>
        {targetRecordsWithMetadata.map(({ record, objectMetadata }) => (
          <RecordChip
            key={record.id as string}
            objectNameSingular={objectMetadata.nameSingular}
            record={record}
            forceDisableClick={disableChipClick}
            triggerEvent={triggerEvent}
          />
        ))}
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
            forceDisableClick={disableChipClick}
          />
        ))}
      </ExpandableList>
    );
  } else {
    return (
      <ExpandableList isChipCountDisplayed={isFocused}>
        {fieldValue?.filter(isDefined).map((record) => {
          const recordChipData = generateRecordChipData(record);
          return (
            <RecordChip
              key={recordChipData.recordId}
              objectNameSingular={recordChipData.objectNameSingular}
              record={record}
              forceDisableClick={disableChipClick}
              triggerEvent={triggerEvent}
            />
          );
        })}
      </ExpandableList>
    );
  }
};
