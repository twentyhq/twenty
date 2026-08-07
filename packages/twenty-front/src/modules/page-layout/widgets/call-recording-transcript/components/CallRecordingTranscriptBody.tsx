import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { CallRecordingTranscriptEntryList } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptEntryList';
import { CallRecordingTranscriptState } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptState';
import { type CalendarEventCallRecordingTranscriptWidgetState } from '@/page-layout/widgets/call-recording-transcript/types/CalendarEventCallRecordingTranscriptWidgetState';
import { t } from '@lingui/core/macro';

type CallRecordingTranscriptBodyProps = {
  callRecordingTranscriptState: CalendarEventCallRecordingTranscriptWidgetState;
};

export const CallRecordingTranscriptBody = ({
  callRecordingTranscriptState,
}: CallRecordingTranscriptBodyProps) => {
  switch (callRecordingTranscriptState.state) {
    case 'LOADING':
      return <WidgetSkeletonLoader />;

    case 'READY':
      return (
        <CallRecordingTranscriptEntryList
          entries={callRecordingTranscriptState.entries}
        />
      );

    case 'QUERY_ERROR':
      return (
        <CallRecordingTranscriptState
          message={t`The transcript could not be loaded.`}
        />
      );

    case 'FORBIDDEN':
      return (
        <CallRecordingTranscriptState
          message={t`You don't have permission to view call recordings.`}
        />
      );

    case 'UNSUPPORTED':
      return (
        <CallRecordingTranscriptState
          message={t`Open a calendar event to view its transcript.`}
        />
      );

    case 'NO_RECORDING':
      return (
        <CallRecordingTranscriptState
          message={t`No call recording exists for this calendar event yet.`}
        />
      );

    case 'PENDING':
      return (
        <CallRecordingTranscriptState
          message={t`Transcript is being prepared…`}
        />
      );

    case 'FAILED':
      return (
        <CallRecordingTranscriptState
          message={t`The transcript could not be generated.`}
        />
      );

    case 'EMPTY':
      return (
        <CallRecordingTranscriptState message={t`The transcript is empty.`} />
      );

    case 'MISSING':
      return (
        <CallRecordingTranscriptState
          message={t`No transcript is available for this recording.`}
        />
      );

    case 'UNRECOGNIZED':
      return (
        <CallRecordingTranscriptState
          message={t`Unrecognized transcript format.`}
        />
      );
  }
};
