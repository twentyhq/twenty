import { useCalendarEventCallRecording } from '@/page-layout/widgets/calendar-event-call-recording/hooks/useCalendarEventCallRecording';
import { CallRecordingSummaryBody } from '@/page-layout/widgets/call-recording-summary/components/CallRecordingSummaryBody';
import { CallRecordingSummaryHeaderDataEffect } from '@/page-layout/widgets/call-recording-summary/components/CallRecordingSummaryHeaderDataEffect';
import { getCallRecordingSummaryMarkdown } from '@/page-layout/widgets/call-recording-summary/utils/getCallRecordingSummaryMarkdown';
import { WidgetHeaderCountEffect } from '@/page-layout/widgets/components/WidgetHeaderCountEffect';
import { isDefined } from 'twenty-shared/utils';

export const CallRecordingSummaryWidgetContent = () => {
  const {
    callRecording,
    callRecordingsCount,
    loading,
    error,
    restriction,
  } = useCalendarEventCallRecording({ queryScope: 'call-recording-summary' });

  const canExposeCallRecordingHeaderData =
    !loading && !isDefined(error) && !isDefined(restriction);

  const summaryMarkdown = getCallRecordingSummaryMarkdown(
    canExposeCallRecordingHeaderData ? callRecording : undefined,
  );

  return (
    <>
      <WidgetHeaderCountEffect
        count={canExposeCallRecordingHeaderData ? callRecordingsCount : 0}
      />
      <CallRecordingSummaryHeaderDataEffect summaryMarkdown={summaryMarkdown} />
      <CallRecordingSummaryBody
        callRecording={callRecording}
        loading={loading}
        error={error}
        restriction={restriction}
      />
    </>
  );
};
