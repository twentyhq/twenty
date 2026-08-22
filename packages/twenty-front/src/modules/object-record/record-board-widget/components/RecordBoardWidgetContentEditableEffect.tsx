import { isRecordBoardCellsNonEditableComponentState } from '@/object-record/record-board/states/isRecordBoardCellsNonEditableComponentState';
import { isRecordBoardViewSettingsReadOnlyComponentState } from '@/object-record/record-board/states/isRecordBoardViewSettingsReadOnlyComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useLayoutEffect } from 'react';

type RecordBoardWidgetContentEditableEffectProps = {
  recordBoardId: string;
  isWidgetContentEditable: boolean;
};

export const RecordBoardWidgetContentEditableEffect = ({
  recordBoardId,
  isWidgetContentEditable,
}: RecordBoardWidgetContentEditableEffectProps) => {
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
    setIsRecordBoardViewSettingsReadOnly(!isWidgetContentEditable);
    setIsRecordBoardCellsNonEditable(!isWidgetContentEditable);

    // Reset to the default on unmount so the flag cannot outlive the
    // widget and leak into a later board mounted on the same instance id.
    return () => {
      setIsRecordBoardViewSettingsReadOnly(false);
      setIsRecordBoardCellsNonEditable(false);
    };
  }, [
    isWidgetContentEditable,
    setIsRecordBoardViewSettingsReadOnly,
    setIsRecordBoardCellsNonEditable,
  ]);

  return null;
};
