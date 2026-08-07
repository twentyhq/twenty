import { CallRecordingTranscriptEntryList } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptEntryList';
import { type CalendarEventCallRecordingTranscriptWidgetState } from '@/page-layout/widgets/call-recording-transcript/types/CalendarEventCallRecordingTranscriptWidgetState';
import { getCallRecordingTranscriptStateMessage } from '@/page-layout/widgets/call-recording-transcript/utils/getCallRecordingTranscriptStateMessage';
import { PageLayoutWidgetErrorDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetErrorDisplay';
import { PageLayoutWidgetForbiddenDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetForbiddenDisplay';
import { PageLayoutWidgetMessageDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetMessageDisplay';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { styled } from '@linaria/react';
import { IconFileText } from 'twenty-ui/icon';

const StyledForbiddenContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: center;
`;

type CallRecordingTranscriptBodyProps = {
  widgetId: string;
  callRecordingTranscriptState: CalendarEventCallRecordingTranscriptWidgetState;
};

export const CallRecordingTranscriptBody = ({
  widgetId,
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

  if (callRecordingTranscriptState.state === 'QUERY_ERROR') {
    return (
      <PageLayoutWidgetErrorDisplay
        widgetId={widgetId}
        error={callRecordingTranscriptState.error}
      />
    );
  }

  if (callRecordingTranscriptState.state === 'FORBIDDEN') {
    return (
      <StyledForbiddenContainer>
        <PageLayoutWidgetForbiddenDisplay
          widgetId={widgetId}
          restriction={callRecordingTranscriptState.restriction}
        />
      </StyledForbiddenContainer>
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
