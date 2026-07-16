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
  }, [isReadOnly, setIsRecordBoardReadOnly]);

  return null;
};
