import { CallRecordingWidgetEmptyStateDisplay } from '@/page-layout/widgets/calendar-event-call-recording/components/CallRecordingWidgetEmptyStateDisplay';
import { CallRecordingWidgetForbiddenDisplay } from '@/page-layout/widgets/calendar-event-call-recording/components/CallRecordingWidgetForbiddenDisplay';
import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { isCallRecordingTranscriptFailed } from '@/page-layout/widgets/calendar-event-call-recording/utils/isCallRecordingTranscriptFailed';
import { isCallRecordingTranscriptPending } from '@/page-layout/widgets/calendar-event-call-recording/utils/isCallRecordingTranscriptPending';
import { CallRecordingTranscriptEntryList } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptEntryList';
import { PageLayoutWidgetErrorDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetErrorDisplay';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { type WidgetAccessDenialInfo } from '@/page-layout/widgets/types/WidgetAccessDenialInfo';
import { t } from '@lingui/core/macro';
import {
  isDefined,
  isNonEmptyArray,
  parseCallRecordingTranscriptEntries,
} from 'twenty-shared/utils';

type CallRecordingTranscriptBodyProps = {
  callRecording: CalendarEventCallRecordingCandidate | undefined;
  loading: boolean;
  error: Error | undefined;
  restriction: WidgetAccessDenialInfo | undefined;
};

export const CallRecordingTranscriptBody = ({
  callRecording,
  loading,
  error,
  restriction,
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

  if (isNonEmptyArray(transcriptEntries)) {
    return <CallRecordingTranscriptEntryList entries={transcriptEntries} />;
  }

  if (isCallRecordingTranscriptPending(callRecording)) {
    return (
      <CallRecordingWidgetEmptyStateDisplay
        animatedPlaceholderType="loadingMessages"
        title={t`Preparing Transcript`}
        subTitle={t`Transcript is being prepared…`}
      />
    );
  }

  if (isCallRecordingTranscriptFailed(callRecording)) {
    return (
      <CallRecordingWidgetEmptyStateDisplay
        animatedPlaceholderType="errorIndex"
        title={t`Transcript Failed`}
        subTitle={t`The transcript could not be generated.`}
      />
    );
  }

  return (
    <CallRecordingWidgetEmptyStateDisplay
      animatedPlaceholderType="noMatchRecord"
      title={t`No Transcript`}
      subTitle={t`No transcript is available for this recording.`}
    />
  );
};
