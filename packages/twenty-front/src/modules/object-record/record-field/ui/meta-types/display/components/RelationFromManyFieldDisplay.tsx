import { useContext, useMemo } from 'react';

import { useActivityTargetObjectRecords } from '@/activities/hooks/useActivityTargetObjectRecords';
import { type NoteTarget } from '@/activities/types/NoteTarget';
import { type TaskTarget } from '@/activities/types/TaskTarget';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { RecordChip } from '@/object-record/components/RecordChip';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useFieldFocus } from '@/object-record/record-field/ui/hooks/useFieldFocus';
import { hasJunctionTargetRelationFieldIds } from '@/object-record/record-field/ui/hooks/useJunctionRelation';
import { useRelationFromManyFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useRelationFromManyFieldDisplay';
import { type FieldRelationMetadataSettings } from '@/object-record/record-field/ui/types/FieldMetadata';

import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import styled from '@emotion/styled';
import { isArray } from '@sniptt/guards';
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
    if (!targetField?.relation) return null;

    const targetObjectMetadata = objectMetadataItems.find(
      (item) => item.id === targetField.relation?.targetObjectMetadata.id,
    );

    return {
      targetField,
      targetObjectMetadata,
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
    const { targetField, targetObjectMetadata } = junctionConfig;

    if (!targetField || !targetObjectMetadata) {
      return null;
    }

    const targetRecords = fieldValue
      .map((junctionRecord) => {
        if (!isDefined(junctionRecord)) return null;
        const targetObject = junctionRecord[targetField.name];
        if (!isDefined(targetObject) || typeof targetObject !== 'object')
          return null;
        return targetObject;
      })
      .filter(isDefined);

    return (
      <ExpandableList isChipCountDisplayed={isFocused}>
        {targetRecords.map((targetRecord) => (
          <RecordChip
            key={targetRecord.id}
            objectNameSingular={targetObjectMetadata.nameSingular}
            record={targetRecord}
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
