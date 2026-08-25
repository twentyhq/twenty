import { CallRecordingWidgetEmptyStateDisplay } from '@/page-layout/widgets/calendar-event-call-recording/components/CallRecordingWidgetEmptyStateDisplay';
import { CallRecordingWidgetForbiddenDisplay } from '@/page-layout/widgets/calendar-event-call-recording/components/CallRecordingWidgetForbiddenDisplay';
import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { CallRecordingTranscriptContent } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptContent';
import { CallRecordingVideoPlayer } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingVideoPlayer';
import { CallRecordingTranscriptPlaybackEffect } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptPlaybackEffect';
import { type CallRecordingTranscriptPlaybackPosition } from '@/page-layout/widgets/call-recording-transcript/types/CallRecordingTranscriptPlaybackPosition';
import { PageLayoutWidgetErrorDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetErrorDisplay';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { type WidgetAccessDenialInfo } from '@/page-layout/widgets/types/WidgetAccessDenialInfo';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { type CallRecordingParsedTranscriptEntry } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const StyledRecordingLayout = styled.div`
  display: grid;
  flex: 1;
  grid-template-rows: auto minmax(0, 1fr);
  min-height: 0;
`;

type CallRecordingTranscriptBodyProps = {
  callRecording: CalendarEventCallRecordingCandidate | undefined;
  transcriptEntries: CallRecordingParsedTranscriptEntry[] | undefined;
  videoFileUrl: string | undefined;
  loading: boolean;
  error: Error | undefined;
  restriction: WidgetAccessDenialInfo | undefined;
  refetchCallRecording: () => Promise<unknown>;
};

export const CallRecordingTranscriptBody = ({
  callRecording,
  transcriptEntries,
  videoFileUrl,
  loading,
  error,
  restriction,
  refetchCallRecording,
}: CallRecordingTranscriptBodyProps) => {
  const widget = useCurrentWidget();
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
    null,
  );

  const [entryPlaybackPosition, setEntryPlaybackPosition] =
    useState<CallRecordingTranscriptPlaybackPosition>({
      activeIndex: -1,
      lastStartedIndex: -1,
    });

  if (isDefined(restriction)) {
    return <CallRecordingWidgetForbiddenDisplay restriction={restriction} />;
  }

  if (loading) {
    return <WidgetSkeletonLoader />;
  }

  if (isDefined(error)) {
    return <PageLayoutWidgetErrorDisplay widgetId={widget.id} error={error} />;
  }

  if (!isDefined(callRecording)) {
    return (
      <CallRecordingWidgetEmptyStateDisplay
        animatedPlaceholderType="noMatchRecord"
        title={t`No Call Recording`}
        subTitle={t`No call recording exists for this calendar event yet.`}
      />
    );
  }

  if (!isDefined(videoFileUrl)) {
    return (
      <CallRecordingTranscriptContent
        callRecording={callRecording}
        transcriptEntries={transcriptEntries}
      />
    );
  }

  const playback = isDefined(videoElement)
    ? {
        position: entryPlaybackPosition,
        videoElement,
        onSeek: (startSeconds: number) => {
          videoElement.currentTime = startSeconds;
        },
      }
    : undefined;

  return (
    <StyledRecordingLayout>
      <CallRecordingTranscriptPlaybackEffect
        videoElement={videoElement}
        timedItems={transcriptEntries}
        onPlaybackPositionChange={setEntryPlaybackPosition}
      />
      <CallRecordingVideoPlayer
        key={videoFileUrl}
        ref={setVideoElement}
        src={videoFileUrl}
        onRetry={refetchCallRecording}
      />
      <CallRecordingTranscriptContent
        callRecording={callRecording}
        transcriptEntries={transcriptEntries}
        playback={playback}
      />
    </StyledRecordingLayout>
  );
};
