import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';

import { useInitDraftValue } from '@/object-record/record-field/ui/hooks/useInitDraftValue';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { useRecordInlineCellContext } from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { getDropdownFocusIdForRecordField } from '@/object-record/utils/getDropdownFocusIdForRecordField';
import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { useSetActiveDropdownFocusIdAndMemorizePrevious } from '@/ui/layout/dropdown/hooks/useSetFocusedDropdownIdAndMemorizePrevious';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';

export const useInlineCell = (
  recordFieldComponentInstanceIdFromProps?: string,
) => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const recordFieldComponentInstanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
    recordFieldComponentInstanceIdFromProps,
  );

  const { onOpenEditMode, onCloseEditMode } = useRecordInlineCellContext();

  const { setActiveDropdownFocusIdAndMemorizePrevious } =
    useSetActiveDropdownFocusIdAndMemorizePrevious();
  const { goBackToPreviousDropdownFocusId } =
    useGoBackToPreviousDropdownFocusId();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const initFieldInputDraftValue = useInitDraftValue();

  const closeInlineCell = () => {
    onCloseEditMode?.();

    const focusId = getDropdownFocusIdForRecordField(
      recordId,
      fieldDefinition.fieldMetadataId,
      'inline-cell',
    );

    removeFocusItemFromFocusStackById({ focusId });
    goBackToPreviousDropdownFocusId();
  };

  const openInlineCell = () => {
    onOpenEditMode?.();
    initFieldInputDraftValue({
      recordId,
      fieldDefinition,
      fieldComponentInstanceId: recordFieldComponentInstanceId,
    });

    const focusId = getDropdownFocusIdForRecordField(
      recordId,
      fieldDefinition.fieldMetadataId,
      'inline-cell',
    );

    pushFocusItemToFocusStack({
      focusId,
      component: {
        type: FocusComponentType.OPENED_FIELD_INPUT,
        instanceId: focusId,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });

    setActiveDropdownFocusIdAndMemorizePrevious(focusId);
  };

  return {
    closeInlineCell,
    openInlineCell,
  };
};
