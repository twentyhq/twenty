import { CallRecordingTranscriptEntryList } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptEntryList';
import { type CalendarEventCallRecordingTranscriptWidgetState } from '@/page-layout/widgets/call-recording-transcript/types/CalendarEventCallRecordingTranscriptWidgetState';
import { PageLayoutWidgetMessageDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetMessageDisplay';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { t } from '@lingui/core/macro';
import { IconFileText } from 'twenty-ui/icon';

const getCallRecordingTranscriptStateMessage = (
  state: Exclude<
    CalendarEventCallRecordingTranscriptWidgetState['state'],
    'LOADING' | 'READY'
  >,
): string => {
  switch (state) {
    case 'QUERY_ERROR':
      return t`The transcript could not be loaded.`;
    case 'FORBIDDEN':
      return t`You don't have permission to view call recordings.`;
    case 'UNSUPPORTED':
      return t`Open a calendar event to view its transcript.`;
    case 'NO_RECORDING':
      return t`No call recording exists for this calendar event yet.`;
    case 'PENDING':
      return t`Transcript is being prepared…`;
    case 'FAILED':
      return t`The transcript could not be generated.`;
    case 'EMPTY':
      return t`The transcript is empty.`;
    case 'MISSING':
      return t`No transcript is available for this recording.`;
    case 'UNRECOGNIZED':
      return t`Unrecognized transcript format.`;
  }
};

type CallRecordingTranscriptBodyProps = {
  callRecordingTranscriptState: CalendarEventCallRecordingTranscriptWidgetState;
};

export const CallRecordingTranscriptBody = ({
  callRecordingTranscriptState,
}: CallRecordingTranscriptBodyProps) => {
  if (callRecordingTranscriptState.state === 'LOADING') {
    return <WidgetSkeletonLoader />;
  }

  if (callRecordingTranscriptState.state === 'READY') {
    return (
      <CallRecordingTranscriptEntryList
        entries={callRecordingTranscriptState.entries}
      />
    );
  }

  return (
    <PageLayoutWidgetMessageDisplay
      Icon={IconFileText}
      message={getCallRecordingTranscriptStateMessage(
        callRecordingTranscriptState.state,
      )}
    />
  );
};
