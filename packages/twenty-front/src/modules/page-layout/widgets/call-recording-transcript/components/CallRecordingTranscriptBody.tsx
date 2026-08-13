import { CallRecordingWidgetEmptyStateDisplay } from '@/page-layout/widgets/calendar-event-call-recording/components/CallRecordingWidgetEmptyStateDisplay';
import { CallRecordingWidgetForbiddenDisplay } from '@/page-layout/widgets/calendar-event-call-recording/components/CallRecordingWidgetForbiddenDisplay';
import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { isCallRecordingTranscriptFailed } from '@/page-layout/widgets/calendar-event-call-recording/utils/isCallRecordingTranscriptFailed';
import { isCallRecordingTranscriptPending } from '@/page-layout/widgets/calendar-event-call-recording/utils/isCallRecordingTranscriptPending';
import { CallRecordingTranscriptEntryList } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptEntryList';
import { CallRecordingVideoPlayer } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingVideoPlayer';
import { PageLayoutWidgetErrorDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetErrorDisplay';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { type WidgetAccessDenialInfo } from '@/page-layout/widgets/types/WidgetAccessDenialInfo';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState, type ReactNode } from 'react';
import { type CallRecordingParsedTranscriptEntry } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const VIDEO_TIME_QUANTIZATION_STEP_SECONDS = 0.25;

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
  refetchCallRecording: () => void;
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
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState(0);

  const updateCurrentTimeSeconds = (videoCurrentTimeSeconds: number) => {
    const nextCurrentTimeSeconds =
      Math.floor(
        videoCurrentTimeSeconds / VIDEO_TIME_QUANTIZATION_STEP_SECONDS,
      ) * VIDEO_TIME_QUANTIZATION_STEP_SECONDS;

    setCurrentTimeSeconds((previousCurrentTimeSeconds) =>
      previousCurrentTimeSeconds === nextCurrentTimeSeconds
        ? previousCurrentTimeSeconds
        : nextCurrentTimeSeconds,
    );
  };

  const handleVideoRetry = () => {
    setCurrentTimeSeconds(0);
    refetchCallRecording();
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
        animatedPlaceholderType="noMatchRecord"
        title={t`No Call Recording`}
        subTitle={t`No call recording exists for this calendar event yet.`}
      />
    );
  }

  let transcriptContent: ReactNode;

  if (isDefined(transcriptEntries) && isNonEmptyArray(transcriptEntries)) {
    transcriptContent = (
      <CallRecordingTranscriptEntryList
        entries={transcriptEntries}
        currentTimeSeconds={
          isDefined(videoFileUrl) ? currentTimeSeconds : undefined
        }
      />
    );
  } else if (isCallRecordingTranscriptPending(callRecording)) {
    transcriptContent = (
      <CallRecordingWidgetEmptyStateDisplay
        animatedPlaceholderType="loadingMessages"
        title={t`Preparing Transcript`}
        subTitle={t`Transcript is being prepared…`}
      />
    );
  } else if (isCallRecordingTranscriptFailed(callRecording)) {
    transcriptContent = (
      <CallRecordingWidgetEmptyStateDisplay
        animatedPlaceholderType="errorIndex"
        title={t`Transcript Failed`}
        subTitle={t`The transcript could not be generated.`}
      />
    );
  } else {
    transcriptContent = (
      <CallRecordingWidgetEmptyStateDisplay
        animatedPlaceholderType="noMatchRecord"
        title={t`No Transcript`}
        subTitle={t`No transcript is available for this recording.`}
      />
    );
  }

  if (!isDefined(videoFileUrl)) {
    return transcriptContent;
  }

  return (
    <StyledRecordingLayout>
      <StyledPlayerSection>
        <CallRecordingVideoPlayer
          src={videoFileUrl}
          onTimeUpdate={updateCurrentTimeSeconds}
          onRetry={handleVideoRetry}
        />
      </StyledPlayerSection>
      <StyledTranscriptScrollContainer>
        {transcriptContent}
      </StyledTranscriptScrollContainer>
    </StyledRecordingLayout>
  );
};
