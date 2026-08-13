import { useCalendarEventCallRecording } from '@/page-layout/widgets/calendar-event-call-recording/hooks/useCalendarEventCallRecording';
import { getCallRecordingVideoFileUrl } from '@/page-layout/widgets/calendar-event-call-recording/utils/getCallRecordingVideoFileUrl';
import { CallRecordingTranscriptBody } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptBody';
import { CallRecordingTranscriptHeaderDataEffect } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptHeaderDataEffect';
import { buildCallRecordingTranscriptPlainText } from '@/page-layout/widgets/call-recording-transcript/utils/buildCallRecordingTranscriptPlainText';
import { WidgetHeaderCountEffect } from '@/page-layout/widgets/components/WidgetHeaderCountEffect';
import { useMemo } from 'react';
import {
  isDefined,
  isNonEmptyArray,
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

  const transcriptEntries = useMemo(
    () =>
      isDefined(callRecording)
        ? parseCallRecordingTranscriptEntries(callRecording.transcript)
        : undefined,
    [callRecording],
  );

  const transcriptPlainText = useMemo(
    () =>
      isDefined(transcriptEntries) && isNonEmptyArray(transcriptEntries)
        ? buildCallRecordingTranscriptPlainText(transcriptEntries)
        : undefined,
    [transcriptEntries],
  );

  const videoFileUrl = isDefined(callRecording)
    ? getCallRecordingVideoFileUrl(callRecording)
    : undefined;

  return (
    <>
      <WidgetHeaderCountEffect
        count={callRecordingsCount > 0 ? callRecordingsCount : undefined}
      />
      <CallRecordingTranscriptHeaderDataEffect
        callRecordingsCount={callRecordingsCount}
        transcriptPlainText={transcriptPlainText}
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
