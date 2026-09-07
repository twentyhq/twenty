import { useCallRecordingWidgetTarget } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingWidgetTarget';

export const useCalendarEventTargetRecordId = (): string | undefined => {
  const callRecordingWidgetTarget = useCallRecordingWidgetTarget();

  return callRecordingWidgetTarget?.targetKind === 'calendarEvent'
    ? callRecordingWidgetTarget.recordId
    : undefined;
};
