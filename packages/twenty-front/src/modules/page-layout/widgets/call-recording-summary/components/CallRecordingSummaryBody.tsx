import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';
import { CallRecordingWidgetEmptyStateDisplay } from '@/page-layout/widgets/calendar-event-call-recording/components/CallRecordingWidgetEmptyStateDisplay';
import { CallRecordingWidgetForbiddenDisplay } from '@/page-layout/widgets/calendar-event-call-recording/components/CallRecordingWidgetForbiddenDisplay';
import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { StyledCallRecordingSummaryContainer } from '@/page-layout/widgets/call-recording-summary/components/CallRecordingSummaryContainer';
import { CallRecordingSummaryEditor } from '@/page-layout/widgets/call-recording-summary/components/CallRecordingSummaryEditor';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useIsRecordFieldReadOnly } from '@/object-record/read-only/hooks/useIsRecordFieldReadOnly';
import { getCallRecordingSummaryMarkdown } from '@/page-layout/widgets/call-recording-summary/utils/getCallRecordingSummaryMarkdown';
import { isCallRecordingSummaryFailed } from '@/page-layout/widgets/call-recording-summary/utils/isCallRecordingSummaryFailed';
import { isCallRecordingSummaryPending } from '@/page-layout/widgets/call-recording-summary/utils/isCallRecordingSummaryPending';
import { PageLayoutWidgetErrorDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetErrorDisplay';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { type WidgetAccessDenialInfo } from '@/page-layout/widgets/types/WidgetAccessDenialInfo';
import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// The markdown renderer spaces blocks for chat bubbles, so its first block and
// leading heading would sit lower than the editor's first block.
const StyledReadOnlySummaryContainer = styled(
  StyledCallRecordingSummaryContainer,
)`
  & > *:first-child,
  & > *:first-child > *:first-child {
    margin-top: 0;
  }
`;

type CallRecordingSummaryBodyProps = {
  callRecording: CalendarEventCallRecordingCandidate | undefined;
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

  const { objectMetadataItem: callRecordingObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.CallRecording,
    });

  const summaryFieldMetadataItem = callRecordingObjectMetadataItem.fields.find(
    (fieldMetadataItem) => fieldMetadataItem.name === 'summary',
  );

  const isSummaryReadOnly = useIsRecordFieldReadOnly({
    recordId: callRecording?.id ?? '',
    objectMetadataId: callRecordingObjectMetadataItem.id,
    fieldMetadataId: summaryFieldMetadataItem?.id ?? '',
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

  const summaryMarkdown = getCallRecordingSummaryMarkdown(callRecording);

  const renderSummary = () => {
    if (!isSummaryReadOnly) {
      return <CallRecordingSummaryEditor callRecordingId={callRecording.id} />;
    }

    if (isDefined(summaryMarkdown)) {
      return (
        <StyledReadOnlySummaryContainer>
          <LazyMarkdownRenderer text={summaryMarkdown} />
        </StyledReadOnlySummaryContainer>
      );
    }

    return (
      <CallRecordingWidgetEmptyStateDisplay
        animatedPlaceholderType="noMatchRecord"
        title={t`No Summary`}
        subTitle={t`No summary has been generated for this call recording yet.`}
      />
    );
  };

  if (isDefined(summaryMarkdown)) {
    return renderSummary();
  }

  if (isCallRecordingSummaryPending(callRecording)) {
    return (
      <CallRecordingWidgetEmptyStateDisplay
        animatedPlaceholderType="loadingMessages"
        title={t`Processing Recording`}
        subTitle={t`The call recording is still being processed…`}
      />
    );
  }

  if (isCallRecordingSummaryFailed(callRecording)) {
    return (
      <CallRecordingWidgetEmptyStateDisplay
        animatedPlaceholderType="errorIndex"
        title={t`Processing Failed`}
        subTitle={t`The call recording could not be processed.`}
      />
    );
  }

  return renderSummary();
};
