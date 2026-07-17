import { isRecordBoardReadOnlyComponentState } from '@/object-record/record-board/states/isRecordBoardReadOnlyComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useEffect } from 'react';

type RecordBoardWidgetReadOnlyEffectProps = {
  recordBoardId: string;
  isReadOnly: boolean;
};

export const RecordBoardWidgetReadOnlyEffect = ({
  recordBoardId,
  isReadOnly,
}: RecordBoardWidgetReadOnlyEffectProps) => {
  const setIsRecordBoardReadOnly = useSetAtomComponentState(
    isRecordBoardReadOnlyComponentState,
    recordBoardId,
  );

  useEffect(() => {
    setIsRecordBoardReadOnly(isReadOnly);

    // Reset to the default on unmount so the flag cannot outlive the
    // widget and leak into a later board mounted on the same instance id.
    return () => {
      setIsRecordBoardReadOnly(false);
    };
  }, [isReadOnly, setIsRecordBoardReadOnly]);

  return null;
};
