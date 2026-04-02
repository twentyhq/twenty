import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { viewableRecordIdComponentState } from '@/side-panel/pages/record-page/states/viewableRecordIdComponentState';
import { viewableRecordNameSingularComponentState } from '@/side-panel/pages/record-page/states/viewableRecordNameSingularComponentState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { requiredFieldsValidationState } from '@/command-menu/states/requiredFieldsValidationState';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { type FieldViolation } from '@/object-record/record-field/ui/hooks/useRecordRequiredFieldViolations';
import { isFieldValueEmpty } from '@/object-record/record-field/ui/utils/isFieldValueEmpty';
import {
  newlyCreatedRecordIdsState,
  persistNewlyCreatedRecordIds,
} from '@/object-record/record-side-panel/states/newlyCreatedRecordIdsState';
import { draftRecordIdsState } from '@/object-record/record-side-panel/states/draftRecordIdsState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const REQUIRED_FIELDS_VALIDATION_MODAL_ID =
  'required-fields-validation-modal';

export const useCommandMenuCloseWithValidation = () => {
  const store = useStore();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { goBackFromSidePanel } = useSidePanelHistory();
  const { openModal } = useModal();

  const getCurrentRecordInfo = useCallback(() => {
    const navigationStack = store.get(sidePanelNavigationStackState.atom);
    const currentItem = navigationStack.at(-1);

    if (!isDefined(currentItem)) return null;

    const sidePanelPage = store.get(sidePanelPageState.atom);
    if (sidePanelPage !== SidePanelPages.ViewRecord) return null;

    const recordId = store.get(
      viewableRecordIdComponentState.atomFamily({
        instanceId: currentItem.pageId,
      }),
    );

    const objectNameSingular = store.get(
      viewableRecordNameSingularComponentState.atomFamily({
        instanceId: currentItem.pageId,
      }),
    );

    if (!recordId || !objectNameSingular) return null;

    return { recordId, objectNameSingular };
  }, [store]);

  const getViolationsForRecord = useCallback(
    (recordId: string, objectNameSingular: string): FieldViolation[] => {
      const objectMetadataItem = store.get(
        objectMetadataItemFamilySelector.selectorFamily({
          objectName: objectNameSingular,
          objectNameType: 'singular',
        }),
      );

      if (!objectMetadataItem) return [];

      const record = store.get(recordStoreFamilyState.atomFamily(recordId));
      // OMNIA-CUSTOM: once a new record is deleted, closing/backing out should
      // bypass required-fields validation instead of reopening the delete modal.
      if (!record || record.deletedAt) return [];

      const violations: FieldViolation[] = [];

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
          fieldEmpty = isFieldValueEmpty({
            fieldDefinition,
            fieldValue,
          });
        } catch {
          fieldEmpty = true;
        }

        if (!fieldEmpty) continue;

        if (requiredCondition.type === 'always') {
          violations.push({
            fieldMetadataId: field.id,
            fieldLabel: field.label,
          });
          continue;
        }

        if (requiredCondition.fieldId) {
          const conditionField = objectMetadataItem.fields.find(
            (f) => f.id === requiredCondition.fieldId,
          );

          if (!conditionField) continue;

          const conditionFieldDefinition =
            formatFieldMetadataItemAsFieldDefinition({
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
            violations.push({
              fieldMetadataId: field.id,
              fieldLabel: field.label,
            });
          }
        }
      }

      return violations;
    },
    [store],
  );

  const discardDraftIfNeeded = useCallback(
    (recordId: string): boolean => {
      const draftMap = store.get(draftRecordIdsState.atom);
      if (!draftMap.has(recordId)) return false;

      // Remove from draft tracking
      const updatedDraftMap = new Map(draftMap);
      updatedDraftMap.delete(recordId);
      store.set(draftRecordIdsState.atom, updatedDraftMap);

      // Remove from record store
      store.set(recordStoreFamilyState.atomFamily(recordId), null);

      // Remove from newly created tracking
      const createdMap = new Map(store.get(newlyCreatedRecordIdsState.atom));
      createdMap.delete(recordId);
      store.set(newlyCreatedRecordIdsState.atom, createdMap);
      persistNewlyCreatedRecordIds(createdMap);

      return true;
    },
    [store],
  );

  const closeWithValidation = useCallback(() => {
    const recordInfo = getCurrentRecordInfo();

    if (!recordInfo) {
      closeSidePanelMenu();
      return;
    }

    const { recordId, objectNameSingular } = recordInfo;

    // Discard draft without validation
    if (discardDraftIfNeeded(recordId)) {
      closeSidePanelMenu();
      return;
    }

    const newlyCreatedMap = store.get(newlyCreatedRecordIdsState.atom);

    if (!newlyCreatedMap.has(recordId)) {
      closeSidePanelMenu();
      return;
    }

    const violations = getViolationsForRecord(recordId, objectNameSingular);

    if (violations.length === 0) {
      closeSidePanelMenu();
      return;
    }

    store.set(requiredFieldsValidationState.atom, {
      pendingAction: 'close',
      violations,
      recordId,
      objectNameSingular,
    });
    openModal(REQUIRED_FIELDS_VALIDATION_MODAL_ID);
  }, [
    closeSidePanelMenu,
    discardDraftIfNeeded,
    getCurrentRecordInfo,
    getViolationsForRecord,
    openModal,
    store,
  ]);

  const goBackWithValidation = useCallback(() => {
    const recordInfo = getCurrentRecordInfo();

    if (!recordInfo) {
      goBackFromSidePanel();
      return;
    }

    const { recordId, objectNameSingular } = recordInfo;

    // Discard draft without validation
    if (discardDraftIfNeeded(recordId)) {
      goBackFromSidePanel();
      return;
    }

    const newlyCreatedMap = store.get(newlyCreatedRecordIdsState.atom);

    if (!newlyCreatedMap.has(recordId)) {
      goBackFromSidePanel();
      return;
    }

    const violations = getViolationsForRecord(recordId, objectNameSingular);

    if (violations.length === 0) {
      goBackFromSidePanel();
      return;
    }

    store.set(requiredFieldsValidationState.atom, {
      pendingAction: 'back',
      violations,
      recordId,
      objectNameSingular,
    });
    openModal(REQUIRED_FIELDS_VALIDATION_MODAL_ID);
  }, [
    discardDraftIfNeeded,
    goBackFromSidePanel,
    getCurrentRecordInfo,
    getViolationsForRecord,
    openModal,
    store,
  ]);

  return {
    closeWithValidation,
    goBackWithValidation,
  };
};
