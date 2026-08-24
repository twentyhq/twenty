import { CallRecordingWidgetEmptyStateDisplay } from '@/page-layout/widgets/calendar-event-call-recording/components/CallRecordingWidgetEmptyStateDisplay';
import { CallRecordingWidgetForbiddenDisplay } from '@/page-layout/widgets/calendar-event-call-recording/components/CallRecordingWidgetForbiddenDisplay';
import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { getCallRecordingVideoFileUrl } from '@/page-layout/widgets/calendar-event-call-recording/utils/getCallRecordingVideoFileUrl';
import { CallRecordingTranscriptContent } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptContent';
import { CallRecordingVideoPlayer } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingVideoPlayer';
import { PageLayoutWidgetErrorDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetErrorDisplay';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { type WidgetAccessDenialInfo } from '@/page-layout/widgets/types/WidgetAccessDenialInfo';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  isDefined,
  parseCallRecordingTranscriptEntries,
} from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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
  loading: boolean;
  error: Error | undefined;
  restriction: WidgetAccessDenialInfo | undefined;
  refetchCallRecording: () => Promise<unknown>;
};

export const CallRecordingTranscriptBody = ({
  callRecording,
  loading,
  error,
  restriction,
  refetchCallRecording,
}: CallRecordingTranscriptBodyProps) => {
  const widget = useCurrentWidget();

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

  const transcriptEntries = parseCallRecordingTranscriptEntries(
    callRecording.transcript,
  );

  const videoFileUrl = getCallRecordingVideoFileUrl(callRecording);

  if (!isDefined(videoFileUrl)) {
    return (
      <CallRecordingTranscriptContent
        callRecording={callRecording}
        transcriptEntries={transcriptEntries}
      />
    );
  }

  return (
    <StyledRecordingLayout>
      <StyledPlayerSection>
        <CallRecordingVideoPlayer
          key={videoFileUrl}
          src={videoFileUrl}
          onRetry={refetchCallRecording}
        />
      </StyledPlayerSection>
      <StyledTranscriptScrollContainer>
        <CallRecordingTranscriptContent
          callRecording={callRecording}
          transcriptEntries={transcriptEntries}
        />
      </StyledTranscriptScrollContainer>
    </StyledRecordingLayout>
  );
};
