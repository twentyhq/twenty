import { CallRecordingWidgetEmptyStateDisplay } from '@/page-layout/widgets/calendar-event-call-recording/components/CallRecordingWidgetEmptyStateDisplay';
import { CallRecordingWidgetForbiddenDisplay } from '@/page-layout/widgets/calendar-event-call-recording/components/CallRecordingWidgetForbiddenDisplay';
import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { CallRecordingTranscriptContent } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptContent';
import { CallRecordingTranscriptPlaybackEffect } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptPlaybackEffect';
import { CallRecordingVideoPlayer } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingVideoPlayer';
import { buildCallRecordingTranscriptTimePoints } from '@/page-layout/widgets/call-recording-transcript/utils/buildCallRecordingTranscriptTimePoints';
import { PageLayoutWidgetErrorDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetErrorDisplay';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { type WidgetAccessDenialInfo } from '@/page-layout/widgets/types/WidgetAccessDenialInfo';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useMemo, useState } from 'react';
import { type CallRecordingParsedTranscriptEntry } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// Media timebase rounding can land an exact-start seek a hair before the
// entry; nudging inside it keeps the clicked entry the active one.
const SEEK_INTO_ENTRY_EPSILON_SECONDS = 0.01;

const StyledRecordingLayout = styled.div`
  display: grid;
  flex: 1;
  grid-template-rows: auto minmax(0, 1fr);
  min-height: 0;
`;

const StyledPlayerSection = styled.div`
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[6]} 0;
`;

const StyledTranscriptScrollContainer = styled.div`
  min-height: 0;
  overflow-y: auto;
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
  const [entryPlaybackPosition, setEntryPlaybackPosition] = useState({
    activeIndex: -1,
    lastStartedIndex: -1,
  });

  const entryTimePoints = useMemo(
    () =>
      isDefined(transcriptEntries)
        ? buildCallRecordingTranscriptTimePoints(transcriptEntries)
        : [],
    [transcriptEntries],
  );

  const hasLivePlayback = isDefined(videoElement);

  const seekVideoToTranscriptEntry = useCallback(
    (entryStartSeconds: number) => {
      if (!isDefined(videoElement)) {
        return;
      }

      videoElement.currentTime =
        entryStartSeconds + SEEK_INTO_ENTRY_EPSILON_SECONDS;
    },
    [videoElement],
  );

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

  const hasTranscriptEntries = isNonEmptyArray(transcriptEntries);

  return (
    <StyledRecordingLayout>
      <CallRecordingTranscriptPlaybackEffect
        videoElement={videoElement}
        timePoints={entryTimePoints}
        onPlaybackPositionChange={setEntryPlaybackPosition}
      />
      <StyledPlayerSection>
        <CallRecordingVideoPlayer
          key={videoFileUrl}
          ref={setVideoElement}
          src={videoFileUrl}
          onRetry={refetchCallRecording}
        />
      </StyledPlayerSection>
      {hasTranscriptEntries ? (
        <CallRecordingTranscriptContent
          callRecording={callRecording}
          transcriptEntries={transcriptEntries}
          activeEntryIndex={
            hasLivePlayback ? entryPlaybackPosition.activeIndex : undefined
          }
          lastStartedEntryIndex={
            hasLivePlayback ? entryPlaybackPosition.lastStartedIndex : undefined
          }
          videoElement={videoElement}
          onEntrySelect={
            hasLivePlayback ? seekVideoToTranscriptEntry : undefined
          }
        />
      ) : (
        <StyledTranscriptScrollContainer>
          <CallRecordingTranscriptContent
            callRecording={callRecording}
            transcriptEntries={transcriptEntries}
          />
        </StyledTranscriptScrollContainer>
      )}
    </StyledRecordingLayout>
  );
};
