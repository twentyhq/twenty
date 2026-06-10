import { atom, useAtom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { useContext, useEffect, useMemo, useState } from 'react';

import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';

import { useActivityTargetObjectRecords } from '@/activities/hooks/useActivityTargetObjectRecords';
import { type NoteTarget } from '@/activities/types/NoteTarget';
import { type TaskTarget } from '@/activities/types/TaskTarget';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { RecordChip } from '@/object-record/components/RecordChip';
import { isActivityTargetField } from '@/object-record/record-field-list/utils/categorizeRelationFields';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useFieldFocus } from '@/object-record/record-field/ui/hooks/useFieldFocus';
import { useRelationFromManyFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useRelationFromManyFieldDisplay';
import { extractTargetRecordsFromJunction } from '@/object-record/record-field/ui/utils/junction/extractTargetRecordsFromJunction';
import { getJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';
import { hasJunctionConfig } from '@/object-record/record-field/ui/utils/junction/hasJunctionConfig';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { styled } from '@linaria/react';
import { isArray } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: flex-start;
  max-width: 100%;
  overflow: hidden;
  width: 100%;
`;

export const locallyDeletedRecordIdsAtomFamily = atomFamily((_key: string) => atom<string[]>([]));

export const RelationFromManyFieldDisplay = () => {
  const { fieldValue, fieldDefinition, generateRecordChipData } =
    useRelationFromManyFieldDisplay();
  const { isFocused } = useFieldFocus();
  const { disableChipClick, triggerEvent, recordId } = useContext(FieldContext);
  const { objectMetadataItems } = useObjectMetadataItems();

  const { fieldName, objectMetadataNameSingular } = fieldDefinition.metadata;

  const relationObjectNameSingular =
    fieldDefinition?.metadata.relationObjectMetadataNameSingular;

  const isJunctionRelation = hasJunctionConfig(
    fieldDefinition.metadata.settings,
  );

  const sourceObjectMetadataId = objectMetadataItems.find(
    (item) => item.nameSingular === objectMetadataNameSingular,
  )?.id;

  const junctionConfig = getJunctionConfig({
    settings: fieldDefinition.metadata.settings,
    relationObjectMetadataId: fieldDefinition.metadata.relationObjectMetadataId,
    sourceObjectMetadataId,
    objectMetadataItems,
  });

  const [displayedFieldValue, setDisplayedFieldValue] = useState(fieldValue);
  const cellKey = `${recordId}-${fieldName}`;
  const [locallyDeletedIds, setLocallyDeletedIds] = useAtom(
    locallyDeletedRecordIdsAtomFamily(cellKey),
  );

  useEffect(() => {
    if (!fieldValue || !isArray(fieldValue)) {
      setDisplayedFieldValue(fieldValue);
      return;
    }

    if (locallyDeletedIds.length == 0) {
      setDisplayedFieldValue(fieldValue);
      return;
    }

    const filteredValues = fieldValue.filter((record) => {
      if (locallyDeletedIds.includes(record.id)) return false;

      const hasMatchingForeignKey = Object.values(record).some(
        (val) => typeof val === 'string' && locallyDeletedIds.includes(val),
      );
      if (hasMatchingForeignKey) return false;

      const hasDestroyedNestedRecord = Object.values(record).some(
        (val) =>
          isDefined(val) &&
          typeof val === 'object' &&
          'id' in val &&
          typeof val.id === 'string' &&
          locallyDeletedIds.includes(val.id),
      );
      if (hasDestroyedNestedRecord) return false;

      return true;
    });
    setDisplayedFieldValue(filteredValues);
  }, [fieldValue, locallyDeletedIds]);

  const isRelationFromManyActivities =
    (fieldName === 'noteTargets' &&
      objectMetadataNameSingular !== CoreObjectNameSingular.Note) ||
    (fieldName === 'taskTargets' &&
      objectMetadataNameSingular !== CoreObjectNameSingular.Task);

  const listenObjectMetadataId = useMemo(() => {
    if (isRelationFromManyActivities) {
      const targetName =
        fieldName === 'noteTargets'
          ? CoreObjectNameSingular.Note
          : CoreObjectNameSingular.Task;
      return objectMetadataItems.find(
        (item) => item.nameSingular === targetName,
      )?.id;
    }

    return fieldDefinition.metadata.relationObjectMetadataId;
  }, [
    isRelationFromManyActivities,
    fieldName,
    objectMetadataItems,
    fieldDefinition.metadata.relationObjectMetadataId,
  ]);

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: (
      detail: ObjectRecordOperationBrowserEventDetail,
    ) => {
      if (detail.operation.type === 'destroy-many') {
        const destroyedIds = detail.operation.destroyedRecordIds;
        setLocallyDeletedIds((prevIds) => [...prevIds, ...destroyedIds]);
      } else if (detail.operation.type === 'destroy-one') {
        const destroyedId = detail.operation.destroyedRecordId;
        setLocallyDeletedIds((prevIds) => [...prevIds, destroyedId]);
      }
    },
    objectMetadataItemId: listenObjectMetadataId,
  });

  const { activityTargetObjectRecords } = useActivityTargetObjectRecords(
    '',
    displayedFieldValue as NoteTarget[] | TaskTarget[],
  );

  if (!isDefined(displayedFieldValue)) {
    return null;
  }

  if (!isArray(displayedFieldValue)) {
    return null;
  }

  if (!isDefined(relationObjectNameSingular)) {
    return null;
  }

  const isRelationFromActivityTargets = isActivityTargetField(
    fieldName,
    objectMetadataNameSingular ?? '',
  );

  if (isRelationFromManyActivities) {
    const objectNameSingular =
      fieldName === 'noteTargets'
        ? CoreObjectNameSingular.Note
        : CoreObjectNameSingular.Task;
    const relationFieldName = fieldName === 'noteTargets' ? 'note' : 'task';

    const chips = displayedFieldValue
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
    const { targetFields } = junctionConfig;

    if (targetFields.length === 0) {
      return null;
    }

    const extractedRecords = extractTargetRecordsFromJunction({
      junctionRecords: displayedFieldValue,
      targetFields,
      objectMetadataItems,
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

    if (
      displayedFieldValue.some(isDefined) &&
      targetRecordsWithMetadata.length === 0
    ) {
      return null;
    }

    return (
      <ExpandableList isChipCountDisplayed={isFocused}>
        {targetRecordsWithMetadata.map(({ record, objectMetadata }) => (
          <RecordChip
            key={record.id}
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
      {displayedFieldValue.filter(isDefined).map((record) => {
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
