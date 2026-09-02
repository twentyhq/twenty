import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';
import { CallRecordingStatusDisplay } from '@/page-layout/widgets/call-recording/components/CallRecordingStatusDisplay';
import { CallRecordingWidgetEmptyStateDisplay } from '@/page-layout/widgets/call-recording/components/CallRecordingWidgetEmptyStateDisplay';
import { CallRecordingWidgetForbiddenDisplay } from '@/page-layout/widgets/call-recording/components/CallRecordingWidgetForbiddenDisplay';
import { type WidgetCallRecordingCandidate } from '@/page-layout/widgets/call-recording/types/WidgetCallRecordingCandidate';
import { getCallRecordingSummaryMarkdown } from '@/page-layout/widgets/call-recording-summary/utils/getCallRecordingSummaryMarkdown';
import { PageLayoutWidgetErrorDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetErrorDisplay';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { type WidgetAccessDenialInfo } from '@/page-layout/widgets/types/WidgetAccessDenialInfo';
import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

const StyledSummaryContainer = styled.div`
  display: flex;
  flex-direction: column;

  // The markdown renderer spaces blocks for chat bubbles, pushing the summary below where the transcript starts.
  & > *:first-child,
  & > *:first-child > *:first-child {
    margin-top: 0;
  }
`;

type CallRecordingSummaryBodyProps = {
  callRecording: WidgetCallRecordingCandidate | undefined;
  loading: boolean;
  error: Error | undefined;
  restriction: WidgetAccessDenialInfo | undefined;
};

export const CallRecordingSummaryBody = ({
  callRecording,
  loading,
  error,
  restriction,
}: CallRecordingSummaryBodyProps) => {
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
        animatedPlaceholderType="noCallRecording"
        title={t`No Call Recording`}
        subTitle={t`No call recording exists for this calendar event yet.`}
      />
    );
  }

  const summaryMarkdown = getCallRecordingSummaryMarkdown(callRecording);

  if (isDefined(summaryMarkdown)) {
    return (
      <StyledSummaryContainer>
        <LazyMarkdownRenderer text={summaryMarkdown} />
      </StyledSummaryContainer>
    );
  }

  return (
    <CallRecordingStatusDisplay
      callRecording={callRecording}
      artifactType="summary"
    />
  );
};
