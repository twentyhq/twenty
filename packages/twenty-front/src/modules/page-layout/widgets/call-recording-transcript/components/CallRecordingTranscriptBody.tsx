import { CallRecordingTranscriptEntryList } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptEntryList';
import { type CalendarEventCallRecordingTranscriptWidgetState } from '@/page-layout/widgets/call-recording-transcript/types/CalendarEventCallRecordingTranscriptWidgetState';
import { getCallRecordingTranscriptStateMessage } from '@/page-layout/widgets/call-recording-transcript/utils/getCallRecordingTranscriptStateMessage';
import { PageLayoutWidgetMessageDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetMessageDisplay';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { IconFileText } from 'twenty-ui/icon';

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
