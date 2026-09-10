import { useCallRecordingWidgetData } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingWidgetData';
import { useCallRecordingWidgetTarget } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingWidgetTarget';
import { getCallRecordingVideoFileUrl } from '@/page-layout/widgets/call-recording/utils/getCallRecordingVideoFileUrl';
import { CallRecordingTranscriptBody } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptBody';
import { WidgetHeaderCountEffect } from '@/page-layout/widgets/components/WidgetHeaderCountEffect';
import { useMemo } from 'react';
import {
  isDefined,
  parseCallRecordingTranscriptEntries,
} from 'twenty-shared/utils';

export const CallRecordingTranscriptWidgetContent = () => {
  const callRecordingWidgetTarget = useCallRecordingWidgetTarget();
  const {
    callRecording,
    callRecordingsCount,
    loading,
    error,
    restriction,
    refetchCallRecordingWidget,
  } = useCallRecordingWidgetData({ kind: 'transcript' });

  const canExposeCallRecordingData =
    !loading && !isDefined(error) && !isDefined(restriction);

  const callRecordingForDisplay = canExposeCallRecordingData
    ? callRecording
    : undefined;

  const transcriptEntries = useMemo(
    () =>
      parseCallRecordingTranscriptEntries(callRecordingForDisplay?.transcript),
    [callRecordingForDisplay?.transcript],
  );

  const videoFileUrl = getCallRecordingVideoFileUrl(callRecordingForDisplay);

  const calendarEventHeaderCount = canExposeCallRecordingData
    ? callRecordingsCount
    : 0;

  const headerCount =
    callRecordingWidgetTarget?.targetKind === 'calendarEvent'
      ? calendarEventHeaderCount
      : undefined;

  return (
    <>
      <WidgetHeaderCountEffect count={headerCount} />
      <CallRecordingTranscriptBody
        callRecording={callRecording}
        transcriptEntries={transcriptEntries}
        videoFileUrl={videoFileUrl}
        loading={loading}
        error={error}
        restriction={restriction}
        refetchCallRecording={refetchCallRecordingWidget}
      />
    </>
  );
};
