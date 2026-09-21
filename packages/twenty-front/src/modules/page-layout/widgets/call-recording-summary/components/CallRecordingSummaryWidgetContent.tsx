import { useCallRecordingWidgetData } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingWidgetData';
import { useCallRecordingWidgetTarget } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingWidgetTarget';
import { CallRecordingSummaryBody } from '@/page-layout/widgets/call-recording-summary/components/CallRecordingSummaryBody';
import { WidgetHeaderCountEffect } from '@/page-layout/widgets/components/WidgetHeaderCountEffect';
import { isDefined } from 'twenty-shared/utils';

export const CallRecordingSummaryWidgetContent = () => {
  const callRecordingWidgetTarget = useCallRecordingWidgetTarget();
  const { callRecording, callRecordingsCount, loading, error, restriction } =
    useCallRecordingWidgetData({ kind: 'summary' });

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
