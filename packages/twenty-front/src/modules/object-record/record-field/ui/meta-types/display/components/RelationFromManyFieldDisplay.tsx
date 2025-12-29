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
import { useRelationFromManyFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useRelationFromManyFieldDisplay';
import { extractTargetRecordsFromJunction } from '@/object-record/record-field/ui/utils/extractTargetRecordsFromJunction';
import { getJunctionConfig } from '@/object-record/record-field/ui/utils/getJunctionConfig';
import { hasJunctionConfig } from '@/object-record/record-field/ui/utils/isJunctionRelation';

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
  const isJunctionRelation = hasJunctionConfig(fieldMetadataItem?.settings);

  // Get junction config for display
  const junctionConfig = useMemo(
    () =>
      getJunctionConfig({
        settings: fieldMetadataItem?.settings,
        relationObjectMetadataId:
          fieldDefinition.metadata.relationObjectMetadataId,
        objectMetadataItems,
      }),
    [
      fieldMetadataItem?.settings,
      fieldDefinition.metadata.relationObjectMetadataId,
      objectMetadataItems,
    ],
  );

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

  if (!isDefined(relationObjectNameSingular)) {
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

    const chips = fieldValue
      .map((record) => {
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
      .filter(isDefined);

    if (isFocused) {
      return (
        <ExpandableList isChipCountDisplayed={isFocused}>
          {chips}
        </ExpandableList>
      );
    }

    return <StyledContainer>{chips}</StyledContainer>;
  }

  if (isJunctionRelation && isDefined(junctionConfig)) {
    const { targetField, morphFields, targetObjectMetadata, isMorphRelation } =
      junctionConfig;

    // For regular relations, require target object metadata
    if (!isMorphRelation && !targetObjectMetadata) {
      return null;
    }

    // For morph relations, require morphFields
    if (isMorphRelation && !isDefined(morphFields)) {
      return null;
    }

    const extractedRecords = extractTargetRecordsFromJunction({
      junctionRecords: fieldValue,
      morphFields,
      targetField,
      targetObjectMetadataId: targetObjectMetadata?.id,
      objectMetadataItems,
      isMorphRelation,
      includeRecord: true,
    });

    const targetRecordsWithMetadata = extractedRecords
      .map((extracted) => {
        const objectMetadata = objectMetadataItems.find(
          (item) => item.id === extracted.objectMetadataId,
        );
        if (!objectMetadata || !extracted.record) {
          return null;
        }
        return { record: extracted.record, objectMetadata };
      })
      .filter(isDefined);

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
  }

  if (isRelationFromActivityTargets) {
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
  }

  return (
    <ExpandableList isChipCountDisplayed={isFocused}>
      {fieldValue.filter(isDefined).map((record) => {
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
};
