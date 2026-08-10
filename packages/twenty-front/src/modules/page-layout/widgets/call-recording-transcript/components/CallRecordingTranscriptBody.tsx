import { type CalendarEventCallRecordingSelection } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingSelection';
import { isCallRecordingTranscriptFailed } from '@/page-layout/widgets/calendar-event-call-recording/utils/isCallRecordingTranscriptFailed';
import { isCallRecordingTranscriptPending } from '@/page-layout/widgets/calendar-event-call-recording/utils/isCallRecordingTranscriptPending';
import { CallRecordingTranscriptEntryList } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptEntryList';
import { PageLayoutWidgetErrorDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetErrorDisplay';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from 'twenty-ui/feedback';

type CallRecordingTranscriptBodyProps = {
  callRecordingSelection: CalendarEventCallRecordingSelection | undefined;
  loading: boolean;
  error: Error | undefined;
};

export const CallRecordingTranscriptBody = ({
  callRecordingSelection,
  loading,
  error,
}: CallRecordingTranscriptBodyProps) => {
  const widget = useCurrentWidget();

  if (loading) {
    return <WidgetSkeletonLoader />;
  }

  if (isDefined(error)) {
    return <PageLayoutWidgetErrorDisplay widgetId={widget.id} error={error} />;
  }

  if (!isDefined(callRecordingSelection)) {
    return (
      // TODO: might need a dedicated call recording animated placeholder
      <AnimatedPlaceholderEmptyContainer>
        <AnimatedPlaceholder type="noMatchRecord" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            {t`No Call Recording`}
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            {t`No call recording exists for this calendar event yet.`}
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
      </AnimatedPlaceholderEmptyContainer>
    );
  }

  if (isDefined(callRecordingSelection.transcriptEntries)) {
    return (
      <CallRecordingTranscriptEntryList
        entries={callRecordingSelection.transcriptEntries}
      />
    );
  }

  if (isCallRecordingTranscriptPending(callRecordingSelection.callRecording)) {
    return (
      <AnimatedPlaceholderEmptyContainer>
        <AnimatedPlaceholder type="loadingMessages" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            {t`Preparing Transcript`}
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            {t`Transcript is being prepared…`}
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
      </AnimatedPlaceholderEmptyContainer>
    );
  }

  if (isCallRecordingTranscriptFailed(callRecordingSelection.callRecording)) {
    return (
      <AnimatedPlaceholderEmptyContainer>
        <AnimatedPlaceholder type="errorIndex" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            {t`Transcript Failed`}
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            {t`The transcript could not be generated.`}
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
      </AnimatedPlaceholderEmptyContainer>
    );
  }

  return (
    <AnimatedPlaceholderEmptyContainer>
      <AnimatedPlaceholder type="noMatchRecord" />
      <AnimatedPlaceholderEmptyTextContainer>
        <AnimatedPlaceholderEmptyTitle>
          {t`No Transcript`}
        </AnimatedPlaceholderEmptyTitle>
        <AnimatedPlaceholderEmptySubTitle>
          {t`No transcript is available for this recording.`}
        </AnimatedPlaceholderEmptySubTitle>
      </AnimatedPlaceholderEmptyTextContainer>
    </AnimatedPlaceholderEmptyContainer>
  );
};
