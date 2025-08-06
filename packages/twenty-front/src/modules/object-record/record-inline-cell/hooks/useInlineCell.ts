import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';

import { useInitDraftValue } from '@/object-record/record-field/hooks/useInitDraftValue';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { useRecordInlineCellContext } from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { getDropdownFocusIdForRecordField } from '@/object-record/utils/getDropdownFocusIdForRecordField';
import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { useSetActiveDropdownFocusIdAndMemorizePrevious } from '@/ui/layout/dropdown/hooks/useSetFocusedDropdownIdAndMemorizePrevious';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { isInlineCellInEditModeFamilyState } from '../states/isInlineCellInEditModeFamilyState';

export const useInlineCell = (
  recordFieldComponentInstanceIdFromProps?: string,
) => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const recordFieldComponentInstanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
    recordFieldComponentInstanceIdFromProps,
  );

  const [isInlineCellInEditMode, setIsInlineCellInEditMode] = useRecoilState(
    isInlineCellInEditModeFamilyState(recordFieldComponentInstanceId),
  );

  const { onOpenEditMode, onCloseEditMode } = useRecordInlineCellContext();

  const { setActiveDropdownFocusIdAndMemorizePrevious } =
    useSetActiveDropdownFocusIdAndMemorizePrevious();
  const { goBackToPreviousDropdownFocusId } =
    useGoBackToPreviousDropdownFocusId();

  const initFieldInputDraftValue = useInitDraftValue();

  const closeInlineCell = () => {
    onCloseEditMode?.();
    setIsInlineCellInEditMode(false);

    goBackToPreviousDropdownFocusId();
  };

  const openInlineCell = () => {
    onOpenEditMode?.();
    setIsInlineCellInEditMode(true);
    initFieldInputDraftValue({
      recordId,
      fieldDefinition,
      fieldComponentInstanceId: recordFieldComponentInstanceId,
    });

    setActiveDropdownFocusIdAndMemorizePrevious(
      getDropdownFocusIdForRecordField(
        recordId,
        fieldDefinition.fieldMetadataId,
        'inline-cell',
      ),
    );
  };

  return {
    isInlineCellInEditMode,
    closeInlineCell,
    openInlineCell,
  };
};
