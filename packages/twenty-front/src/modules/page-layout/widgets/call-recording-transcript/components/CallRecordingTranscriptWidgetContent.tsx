import { useCalendarEventCallRecording } from '@/page-layout/widgets/calendar-event-call-recording/hooks/useCalendarEventCallRecording';
import { getCallRecordingVideoFileUrl } from '@/page-layout/widgets/calendar-event-call-recording/utils/getCallRecordingVideoFileUrl';
import { CallRecordingTranscriptBody } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptBody';
import { CallRecordingTranscriptHeaderDataEffect } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptHeaderDataEffect';
import { WidgetHeaderCountEffect } from '@/page-layout/widgets/components/WidgetHeaderCountEffect';
import { useMemo } from 'react';
import {
  isDefined,
  parseCallRecordingTranscriptEntries,
} from 'twenty-shared/utils';

export const CallRecordingTranscriptWidgetContent = () => {
  const {
    callRecording,
    callRecordingsCount,
    loading,
    error,
    restriction,
    refetch,
  } = useCalendarEventCallRecording({
    queryScope: 'call-recording-transcript',
  });

  const canExposeCallRecordingHeaderData =
    !loading && !isDefined(error) && !isDefined(restriction);

  const callRecordingForHeader = canExposeCallRecordingHeaderData
    ? callRecording
    : undefined;

  const transcriptEntries = useMemo(
    () =>
      parseCallRecordingTranscriptEntries(callRecordingForHeader?.transcript),
    [callRecordingForHeader?.transcript],
  );

  const videoFileUrl = getCallRecordingVideoFileUrl(callRecordingForHeader);

  return (
    <>
      <WidgetHeaderCountEffect
        count={canExposeCallRecordingHeaderData ? callRecordingsCount : 0}
      />
      <CallRecordingTranscriptHeaderDataEffect
        transcriptEntries={transcriptEntries}
        videoFileUrl={videoFileUrl}
      />
      <CallRecordingTranscriptBody
        callRecording={callRecording}
        transcriptEntries={transcriptEntries}
        videoFileUrl={videoFileUrl}
        loading={loading}
        error={error}
        restriction={restriction}
        refetchCallRecording={refetch}
      />
    </>
  );
};
