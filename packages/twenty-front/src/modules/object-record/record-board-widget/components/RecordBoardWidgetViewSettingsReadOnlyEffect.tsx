import { isRecordBoardViewSettingsReadOnlyComponentState } from '@/object-record/record-board/states/isRecordBoardViewSettingsReadOnlyComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useEffect } from 'react';

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

  useEffect(() => {
    setIsRecordBoardViewSettingsReadOnly(isViewSettingsReadOnly);

    // Reset to the default on unmount so the flag cannot outlive the
    // widget and leak into a later board mounted on the same instance id.
    return () => {
      setIsRecordBoardViewSettingsReadOnly(false);
    };
  }, [isViewSettingsReadOnly, setIsRecordBoardViewSettingsReadOnly]);

  return null;
};
