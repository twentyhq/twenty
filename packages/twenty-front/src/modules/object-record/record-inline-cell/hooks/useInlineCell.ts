import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';

import { useInitDraftValue } from '@/object-record/record-field/ui/hooks/useInitDraftValue';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { useRecordInlineCellContext } from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
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

  const initFieldInputDraftValue = useInitDraftValue();

  const closeInlineCell = () => {
    onCloseEditMode?.();
  };

  const openInlineCell = () => {
    onOpenEditMode?.();
    initFieldInputDraftValue({
      recordId,
      fieldDefinition,
      fieldComponentInstanceId: recordFieldComponentInstanceId,
    });
  };

  return {
    closeInlineCell,
    openInlineCell,
  };
};
