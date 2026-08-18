import { isRecordBoardCellsNonEditableComponentState } from '@/object-record/record-board/states/isRecordBoardCellsNonEditableComponentState';
import { isRecordBoardViewSettingsReadOnlyComponentState } from '@/object-record/record-board/states/isRecordBoardViewSettingsReadOnlyComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useLayoutEffect } from 'react';

type RecordBoardWidgetViewSettingsReadOnlyEffectProps = {
  recordBoardId: string;
  isViewSettingsReadOnly: boolean;
  isRecordCellsNonEditable: boolean;
};

export const RecordBoardWidgetViewSettingsReadOnlyEffect = ({
  recordBoardId,
  isViewSettingsReadOnly,
  isRecordCellsNonEditable,
}: RecordBoardWidgetViewSettingsReadOnlyEffectProps) => {
  const setIsRecordBoardViewSettingsReadOnly = useSetAtomComponentState(
    isRecordBoardViewSettingsReadOnlyComponentState,
    recordBoardId,
  );

  const setIsRecordBoardCellsNonEditable = useSetAtomComponentState(
    isRecordBoardCellsNonEditableComponentState,
    recordBoardId,
  );

  // Synchronized before paint so read-only widgets never flash (or
  // briefly accept interaction on) their editable controls.
  useLayoutEffect(() => {
    setIsRecordBoardViewSettingsReadOnly(isViewSettingsReadOnly);
    setIsRecordBoardCellsNonEditable(isRecordCellsNonEditable);

    // Reset to the default on unmount so the flag cannot outlive the
    // widget and leak into a later board mounted on the same instance id.
    return () => {
      setIsRecordBoardViewSettingsReadOnly(false);
      setIsRecordBoardCellsNonEditable(false);
    };
  }, [
    isViewSettingsReadOnly,
    isRecordCellsNonEditable,
    setIsRecordBoardViewSettingsReadOnly,
    setIsRecordBoardCellsNonEditable,
  ]);

  return null;
};
