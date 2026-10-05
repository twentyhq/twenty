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

  // Layout effect so read-only widgets never flash their editable controls.
  useLayoutEffect(() => {
    setIsRecordCalendarReadOnly(isReadOnly);

    // Reset so the flag cannot leak into a later calendar on the same instance id.
    return () => {
      setIsRecordCalendarReadOnly(false);
    };
  }, [isReadOnly, setIsRecordCalendarReadOnly]);

  return null;
};
