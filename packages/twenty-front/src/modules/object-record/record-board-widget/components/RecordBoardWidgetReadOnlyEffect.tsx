import { isRecordBoardReadOnlyComponentState } from '@/object-record/record-board/states/isRecordBoardReadOnlyComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useLayoutEffect } from 'react';

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

  // Synchronized before paint so read-only widgets never flash (or
  // briefly accept interaction on) their editable controls.
  useLayoutEffect(() => {
    setIsRecordBoardReadOnly(isReadOnly);
  }, [isReadOnly, setIsRecordBoardReadOnly]);

  return null;
};
