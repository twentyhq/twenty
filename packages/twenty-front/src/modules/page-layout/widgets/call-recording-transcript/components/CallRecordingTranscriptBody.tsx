import { CallRecordingAudioPlayer } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingAudioPlayer';
import { type CallRecordingPlaybackMedia } from '@/page-layout/widgets/call-recording/types/CallRecordingPlaybackMedia';
import { CallRecordingStatusDisplay } from '@/page-layout/widgets/call-recording/components/CallRecordingStatusDisplay';
import { CallRecordingWidgetEmptyStateDisplay } from '@/page-layout/widgets/call-recording/components/CallRecordingWidgetEmptyStateDisplay';
import { CallRecordingWidgetForbiddenDisplay } from '@/page-layout/widgets/call-recording/components/CallRecordingWidgetForbiddenDisplay';
import { type WidgetCallRecordingCandidate } from '@/page-layout/widgets/call-recording/types/WidgetCallRecordingCandidate';
import { CallRecordingTranscriptContent } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptContent';
import { CallRecordingVideoPlayer } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingVideoPlayer';
import { CallRecordingTranscriptPlaybackEffect } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptPlaybackEffect';
import { INITIAL_CALL_RECORDING_TRANSCRIPT_PLAYBACK_POSITION } from '@/page-layout/widgets/call-recording-transcript/constants/InitialCallRecordingTranscriptPlaybackPosition';
import { PageLayoutWidgetErrorDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetErrorDisplay';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { type WidgetAccessDenialInfo } from '@/page-layout/widgets/types/WidgetAccessDenialInfo';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { type CallRecordingParsedTranscriptEntry } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledRecordingLayout = styled.div<{ hasTranscriptEntries: boolean }>`
  display: ${({ hasTranscriptEntries }) =>
    hasTranscriptEntries ? 'grid' : 'flex'};
  flex: ${({ hasTranscriptEntries }) => (hasTranscriptEntries ? '1' : 'none')};
  flex-direction: column;
  grid-template-rows: auto minmax(0, 1fr);
  min-height: ${({ hasTranscriptEntries }) =>
    hasTranscriptEntries ? '0' : '100%'};
`;

const StyledStatusBelowMedia = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  padding: ${themeCssVariables.spacing[6]} 0;
`;

type CallRecordingTranscriptBodyProps = {
  callRecording: WidgetCallRecordingCandidate | undefined;
  transcriptEntries: CallRecordingParsedTranscriptEntry[] | undefined;
  playbackMedia: CallRecordingPlaybackMedia | undefined;
  loading: boolean;
  error: Error | undefined;
  restriction: WidgetAccessDenialInfo | undefined;
  refetchCallRecording: () => Promise<void>;
};

export const CallRecordingTranscriptBody = ({
  callRecording,
  transcriptEntries,
  playbackMedia,
  loading,
  error,
  restriction,
  refetchCallRecording,
}: CallRecordingTranscriptBodyProps) => {
  const widget = useCurrentWidget();
  const [mediaElement, setMediaElement] = useState<HTMLMediaElement | null>(
    null,
  );

  const [entryPlaybackPosition, setEntryPlaybackPosition] = useState(
    INITIAL_CALL_RECORDING_TRANSCRIPT_PLAYBACK_POSITION,
  );

  const [pinnedPlaybackMedia, setPinnedPlaybackMedia] = useState(playbackMedia);

  const isPinnedPlaybackMediaCurrent =
    pinnedPlaybackMedia?.fileId === playbackMedia?.fileId &&
    pinnedPlaybackMedia?.kind === playbackMedia?.kind;

  if (!isPinnedPlaybackMediaCurrent) {
    setPinnedPlaybackMedia(playbackMedia);
  }

  const displayedPlaybackMedia = isPinnedPlaybackMediaCurrent
    ? pinnedPlaybackMedia
    : playbackMedia;

  const handleRetry = async () => {
    await refetchCallRecording();
    setPinnedPlaybackMedia(undefined);
  };

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
        animatedPlaceholderType="noCallRecording"
        title={t`No Transcript`}
        subTitle={t`No transcript is available for this calendar event yet.`}
      />
    );
  }

  if (!isDefined(displayedPlaybackMedia)) {
    return (
      <CallRecordingTranscriptContent
        callRecording={callRecording}
        transcriptEntries={transcriptEntries}
      />
    );
  }

  const mediaPlayer =
    displayedPlaybackMedia.kind === 'video' ? (
      <CallRecordingVideoPlayer
        key={displayedPlaybackMedia.fileId}
        ref={setMediaElement}
        src={displayedPlaybackMedia.url}
        onRetry={handleRetry}
      />
    ) : (
      <CallRecordingAudioPlayer
        key={displayedPlaybackMedia.fileId}
        ref={setMediaElement}
        src={displayedPlaybackMedia.url}
        onRetry={handleRetry}
      />
    );

  const hasTranscriptEntries = isNonEmptyArray(transcriptEntries);

  const playback = isDefined(mediaElement)
    ? {
        position: entryPlaybackPosition,
        mediaElement,
        onSeek: (startSeconds: number) => {
          mediaElement.currentTime = startSeconds;
        },
      }
    : undefined;

  return (
    <StyledRecordingLayout hasTranscriptEntries={hasTranscriptEntries}>
      <CallRecordingTranscriptPlaybackEffect
        mediaElement={mediaElement}
        timedItems={transcriptEntries}
        onPlaybackPositionChange={setEntryPlaybackPosition}
      />
      {mediaPlayer}
      {hasTranscriptEntries ? (
        <CallRecordingTranscriptContent
          callRecording={callRecording}
          transcriptEntries={transcriptEntries}
          playback={playback}
        />
      ) : (
        <StyledStatusBelowMedia>
          <CallRecordingStatusDisplay
            callRecording={callRecording}
            artifactType="transcript"
          />
        </StyledStatusBelowMedia>
      )}
    </StyledRecordingLayout>
  );
};
