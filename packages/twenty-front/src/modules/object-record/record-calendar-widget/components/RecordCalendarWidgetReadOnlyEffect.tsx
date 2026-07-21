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

    // Reset to the default on unmount so the flag cannot outlive the
    // widget and leak into a later calendar mounted on the same instance id.
    return () => {
      setIsRecordCalendarReadOnly(false);
    };
  }, [isReadOnly, setIsRecordCalendarReadOnly]);

  return null;
};
