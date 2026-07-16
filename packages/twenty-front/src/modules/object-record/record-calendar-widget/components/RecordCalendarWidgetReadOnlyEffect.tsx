import { isRecordCalendarReadOnlyComponentState } from '@/object-record/record-calendar/states/isRecordCalendarReadOnlyComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useEffect } from 'react';

type RecordCalendarWidgetReadOnlyEffectProps = {
  recordCalendarId: string;
  isReadOnly: boolean;
};

export const RecordCalendarWidgetReadOnlyEffect = ({
  recordCalendarId,
  isReadOnly,
}: RecordCalendarWidgetReadOnlyEffectProps) => {
  const setIsRecordCalendarReadOnly = useSetAtomComponentState(
    isRecordCalendarReadOnlyComponentState,
    recordCalendarId,
  );

  useEffect(() => {
    setIsRecordCalendarReadOnly(isReadOnly);
  }, [isReadOnly, setIsRecordCalendarReadOnly]);

  return null;
};
