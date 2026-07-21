import { isRecordBoardViewSettingsReadOnlyComponentState } from '@/object-record/record-board/states/isRecordBoardViewSettingsReadOnlyComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useLayoutEffect } from 'react';

type RecordBoardWidgetViewSettingsReadOnlyEffectProps = {
  recordBoardId: string;
  isViewSettingsReadOnly: boolean;
};

export const RecordBoardWidgetViewSettingsReadOnlyEffect = ({
  recordBoardId,
  isViewSettingsReadOnly,
}: RecordBoardWidgetViewSettingsReadOnlyEffectProps) => {
  const setIsRecordBoardViewSettingsReadOnly = useSetAtomComponentState(
    isRecordBoardViewSettingsReadOnlyComponentState,
    recordBoardId,
  );

  // Synchronized before paint so read-only widgets never flash (or
  // briefly accept interaction on) their editable controls.
  useLayoutEffect(() => {
    setIsRecordBoardViewSettingsReadOnly(isViewSettingsReadOnly);

    // Reset to the default on unmount so the flag cannot outlive the
    // widget and leak into a later board mounted on the same instance id.
    return () => {
      setIsRecordBoardViewSettingsReadOnly(false);
    };
  }, [isViewSettingsReadOnly, setIsRecordBoardViewSettingsReadOnly]);

  return null;
};
