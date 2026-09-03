import { useCallRecordingWidgetTarget } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingWidgetTarget';
import { CallRecordingSummaryBody } from '@/page-layout/widgets/call-recording-summary/components/CallRecordingSummaryBody';
import { useCallRecordingSummaryWidgetData } from '@/page-layout/widgets/call-recording-summary/hooks/useCallRecordingSummaryWidgetData';
import { WidgetHeaderCountEffect } from '@/page-layout/widgets/components/WidgetHeaderCountEffect';
import { isDefined } from 'twenty-shared/utils';

export const CallRecordingSummaryWidgetContent = () => {
  const callRecordingWidgetTarget = useCallRecordingWidgetTarget();
  const { callRecording, callRecordingsCount, loading, error, restriction } =
    useCallRecordingSummaryWidgetData();

  const canExposeCallRecordingCount =
    !loading && !isDefined(error) && !isDefined(restriction);

  const calendarEventHeaderCount = canExposeCallRecordingCount
    ? callRecordingsCount
    : 0;

  const headerCount =
    callRecordingWidgetTarget?.targetKind === 'calendarEvent'
      ? calendarEventHeaderCount
      : undefined;

  return (
    <>
      <WidgetHeaderCountEffect count={headerCount} />
      <CallRecordingSummaryBody
        callRecording={callRecording}
        loading={loading}
        error={error}
        restriction={restriction}
      />
    </>
  );
};
