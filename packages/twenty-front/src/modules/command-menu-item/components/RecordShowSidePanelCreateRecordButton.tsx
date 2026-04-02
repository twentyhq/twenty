import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import {
  type FieldViolation,
} from '@/object-record/record-field/ui/hooks/useRecordRequiredFieldViolations';
import {
  draftRecordIdsState,
  type DraftRecordMeta,
} from '@/object-record/record-side-panel/states/draftRecordIdsState';
import {
  newlyCreatedRecordIdsState,
  persistNewlyCreatedRecordIds,
} from '@/object-record/record-side-panel/states/newlyCreatedRecordIdsState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { isFieldValueEmpty } from '@/object-record/record-field/ui/utils/isFieldValueEmpty';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback, useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { getOsControlSymbol } from 'twenty-ui/utilities';

type RecordShowSidePanelCreateRecordButtonProps = {
  objectNameSingular: string;
  recordId: string;
};

const getViolationsForDraft = (
  record: ObjectRecord | null | undefined,
  draftMeta: DraftRecordMeta,
): FieldViolation[] => {
  if (!record) return [];

  const violations: FieldViolation[] = [];
  const { objectMetadataItem } = draftMeta;

  for (const field of objectMetadataItem.fields) {
    const requiredCondition = field.requiredCondition as
      | { type: string; fieldId?: string }
      | null
      | undefined;

    if (!requiredCondition) continue;

    const fieldDefinition = formatFieldMetadataItemAsFieldDefinition({
      field,
      objectMetadataItem,
    });

    const fieldValue = record[field.name];

    let fieldEmpty: boolean;
    try {
      fieldEmpty = isFieldValueEmpty({ fieldDefinition, fieldValue });
    } catch {
      fieldEmpty = true;
    }

    if (!fieldEmpty) continue;

    if (requiredCondition.type === 'always') {
      violations.push({ fieldMetadataId: field.id, fieldLabel: field.label });
      continue;
    }

    if (requiredCondition.fieldId) {
      const conditionField = objectMetadataItem.fields.find(
        (f) => f.id === requiredCondition.fieldId,
      );
      if (!conditionField) continue;

      const conditionFieldDefinition = formatFieldMetadataItemAsFieldDefinition({
        field: conditionField,
        objectMetadataItem,
      });

      const conditionValue = record[conditionField.name];
      let conditionEmpty: boolean;
      try {
        conditionEmpty = isFieldValueEmpty({
          fieldDefinition: conditionFieldDefinition,
          fieldValue: conditionValue,
        });
      } catch {
        conditionEmpty = true;
      }

      const isRequired =
        (requiredCondition.type === 'fieldEmpty' && conditionEmpty) ||
        (requiredCondition.type === 'fieldNotEmpty' && !conditionEmpty);

      if (isRequired) {
        violations.push({ fieldMetadataId: field.id, fieldLabel: field.label });
      }
    }
  }

  return violations;
};

export const RecordShowSidePanelCreateRecordButton = ({
  objectNameSingular,
  recordId,
}: RecordShowSidePanelCreateRecordButtonProps) => {
  const store = useStore();
  const [isCreating, setIsCreating] = useState(false);

  const draftRecordIds = useAtomStateValue(draftRecordIdsState);
  const draftMeta = draftRecordIds.get(recordId);

  const record = useAtomFamilyStateValue(recordStoreFamilyState, recordId) as
    | ObjectRecord
    | null
    | undefined;

  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular,
    shouldMatchRootQueryFilter: true,
  });

  const { upsertRecordsInStore } = useUpsertRecordsInStore();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const violations = useMemo(
    () => (draftMeta ? getViolationsForDraft(record, draftMeta) : []),
    [record, draftMeta],
  );

  const isDisabled = violations.length > 0 || isCreating;

  const handleCreateRecord = useCallback(async () => {
    if (!draftMeta || isCreating) return;

    setIsCreating(true);

    try {
      const currentRecord = store.get(
        recordStoreFamilyState.atomFamily(recordId),
      );

      if (!isDefined(currentRecord)) return;

      // Strip system fields and relation objects that the server manages.
      // Only send scalar fields, FK IDs, and the record ID.
      const SYSTEM_FIELDS = new Set([
        '__typename',
        'createdAt',
        'updatedAt',
        'deletedAt',
        'createdBy',
        'updatedBy',
        'position',
      ]);

      const recordInput: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(currentRecord)) {
        if (SYSTEM_FIELDS.has(key)) continue;

        // Skip relation objects (non-null objects with an `id` property that
        // aren't composite field values like currency/address).
        // The FK field (e.g. carrierId) is already in the record separately.
        if (
          isDefined(value) &&
          typeof value === 'object' &&
          !Array.isArray(value) &&
          'id' in (value as Record<string, unknown>) &&
          '__typename' in (value as Record<string, unknown>)
        ) {
          continue;
        }

        recordInput[key] = value;
      }

      // Apply extra record input (e.g., position)
      Object.assign(recordInput, draftMeta.extraRecordInput ?? {});

      const createdRecord = await createOneRecord(recordInput);

      // Remove from draft tracking
      const updatedDraftMap = new Map(store.get(draftRecordIdsState.atom));
      updatedDraftMap.delete(recordId);
      store.set(draftRecordIdsState.atom, updatedDraftMap);

      // Add to newly created tracking (for navigate-away validation)
      const createdMap = new Map(store.get(newlyCreatedRecordIdsState.atom));
      createdMap.set(recordId, objectNameSingular);
      store.set(newlyCreatedRecordIdsState.atom, createdMap);
      persistNewlyCreatedRecordIds(createdMap);

      // Update store with server response
      upsertRecordsInStore({ partialRecords: [createdRecord] });

      // Run post-creation callback (relation linking, group tracking, etc.)
      await draftMeta.onRecordCreated?.(createdRecord);

      // Close side panel on success
      closeSidePanelMenu();
    } finally {
      setIsCreating(false);
    }
  }, [
    draftMeta,
    isCreating,
    store,
    recordId,
    createOneRecord,
    objectNameSingular,
    upsertRecordsInStore,
  ]);

  useHotkeysOnFocusedElement({
    keys: ['ctrl+Enter,meta+Enter'],
    callback: () => {
      if (!isDisabled) {
        handleCreateRecord();
      }
    },
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [handleCreateRecord, isDisabled],
  });

  return (
    <Button
      title={t`Create`}
      variant="primary"
      accent="blue"
      size="small"
      Icon={IconPlus}
      hotkeys={[getOsControlSymbol(), '⏎']}
      onClick={handleCreateRecord}
      disabled={isDisabled}
    />
  );
};
