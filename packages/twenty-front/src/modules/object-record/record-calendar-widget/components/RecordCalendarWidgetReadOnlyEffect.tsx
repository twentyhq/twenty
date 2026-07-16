import { isRecordCalendarReadOnlyComponentState } from '@/object-record/record-calendar/states/isRecordCalendarReadOnlyComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useLayoutEffect } from 'react';

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

  // Synchronized before paint so read-only widgets never flash (or
  // briefly accept interaction on) their editable controls.
  useLayoutEffect(() => {
    setIsRecordCalendarReadOnly(isReadOnly);
  }, [isReadOnly, setIsRecordCalendarReadOnly]);

  return null;
};
