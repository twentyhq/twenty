import { useCallRecordingWidgetTarget } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingWidgetTarget';
import { useWidgetCallRecording } from '@/page-layout/widgets/call-recording/hooks/useWidgetCallRecording';
import { getCallRecordingVideoFileUrl } from '@/page-layout/widgets/call-recording/utils/getCallRecordingVideoFileUrl';
import { CallRecordingTranscriptBody } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptBody';
import { CallRecordingTranscriptHeaderDataEffect } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptHeaderDataEffect';
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
    refetch,
  } = useWidgetCallRecording({
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

  // The count answers how many recordings the calendar event has; a call
  // recording record page always shows its own single recording.
  const headerCount =
    callRecordingWidgetTarget?.targetKind === 'calendarEvent'
      ? canExposeCallRecordingHeaderData
        ? callRecordingsCount
        : 0
      : undefined;

  return (
    <>
      <WidgetHeaderCountEffect count={headerCount} />
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
