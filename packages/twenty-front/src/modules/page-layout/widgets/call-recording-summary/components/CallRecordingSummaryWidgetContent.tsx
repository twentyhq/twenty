import { useCalendarEventCallRecording } from '@/page-layout/widgets/calendar-event-call-recording/hooks/useCalendarEventCallRecording';
import { useCallRecordingSummaryFieldAccess } from '@/page-layout/widgets/calendar-event-call-recording/hooks/useCallRecordingSummaryFieldAccess';
import { CallRecordingSummaryBody } from '@/page-layout/widgets/call-recording-summary/components/CallRecordingSummaryBody';
import { getCalendarEventCallRecordingSummaryWidgetState } from '@/page-layout/widgets/call-recording-summary/utils/getCalendarEventCallRecordingSummaryWidgetState';

export const CallRecordingSummaryWidgetContent = () => {
  const { callRecordingState } = useCalendarEventCallRecording();
  const { isSummaryFieldMetadataMissing, restrictedSummaryFieldLabel } =
    useCallRecordingSummaryFieldAccess();

  const callRecordingSummaryState =
    getCalendarEventCallRecordingSummaryWidgetState({
      callRecordingState,
      isSummaryFieldMetadataMissing,
      restrictedSummaryFieldLabel,
    });

  return (
    <CallRecordingSummaryBody
      callRecordingSummaryState={callRecordingSummaryState}
    />
  );
};
